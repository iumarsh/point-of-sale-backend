const Transaction = require('../model/Transaction');
const Category = require('../model/Category');
const mongoose = require('mongoose');

const resolveCategoryId = (item) => {
	if (item?.category?._id) return item.category._id.toString();
	if (item?.category) return item.category.toString();
	return null;
};

const addDelta = (map, categoryId, delta) => {
	if (!categoryId || !delta) return;
	map.set(categoryId, (map.get(categoryId) || 0) + delta);
};

// Apply net stock changes in one find + bulkWrite.
// delta > 0 restores stock; delta < 0 deducts stock.
const applyCategoryStockDeltas = async (deltaByCategoryId) => {
	const categoryIds = [...deltaByCategoryId.keys()].filter(
		(id) => (deltaByCategoryId.get(id) || 0) !== 0
	);
	if (!categoryIds.length) return;

	for (const categoryId of categoryIds) {
		if (!mongoose.Types.ObjectId.isValid(categoryId)) {
			const err = new Error(`Invalid category id ${categoryId}`);
			err.status = 400;
			throw err;
		}
	}

	const categories = await Category.find({ _id: { $in: categoryIds } });
	const categoryById = new Map(categories.map((c) => [c._id.toString(), c]));

	for (const categoryId of categoryIds) {
		const category = categoryById.get(categoryId);
		const delta = deltaByCategoryId.get(categoryId);

		if (!category) {
			const err = new Error(`Category for item ${categoryId} not found`);
			err.status = 404;
			throw err;
		}
		if (delta < 0 && category.quantity < -delta) {
			const err = new Error(`Insufficient quantity for item ${category.name}`);
			err.status = 500;
			throw err;
		}
	}

	const bulkOps = categoryIds.map((categoryId) => {
		const delta = deltaByCategoryId.get(categoryId);
		const filter = { _id: categoryId };
		if (delta < 0) {
			filter.quantity = { $gte: -delta };
		}
		return {
			updateOne: {
				filter,
				update: { $inc: { quantity: delta } },
			},
		};
	});

	const bulkResult = await Category.bulkWrite(bulkOps);
	if (bulkResult.modifiedCount !== categoryIds.length) {
		const err = new Error('Failed to update inventory; one or more items may have insufficient stock');
		err.status = 500;
		throw err;
	}
};

const deductCategoryQuantities = async (items) => {
	const deltaByCategoryId = new Map();

	for (const item of items) {
		const categoryId = resolveCategoryId(item);
		const quantity = Number(item.quantity) || 0;

		if (!categoryId) {
			const err = new Error(`Category for item ${item.name || 'unknown'} not found`);
			err.status = 404;
			throw err;
		}

		addDelta(deltaByCategoryId, categoryId, -quantity);
	}

	await applyCategoryStockDeltas(deltaByCategoryId);
};

const addTransaction = async (req, res) => {
	try {
		const { items, grandTotal, customerName, builty, cnic, contact, transactionType="", receiving } = req.body;

		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ error: 'Items are required' });
		}

		await deductCategoryQuantities(items);

		const newTransaction = new Transaction({
			items,
			grandTotal,
			customerName,
			builty,
			cnic,
			contact,
			receiving,
			transactionType
		});

		await newTransaction.save();

		res.status(201).json({ message: 'Transaction added successfully', transaction: newTransaction });
	} catch (error) {
		console.error(error);
		if (error.status) {
			return res.status(error.status).json({ error: error.message });
		}
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
const getTransactionById = async (req, res) => {
	try {
		const { id } = req.params;

		// Find the transaction by ID
		const transaction = await Transaction.findById(id).populate({
			path: 'items.category',
			select: 'name categoryType quantity'
		});

		// Check if transaction exists
		if (!transaction) {
			return res.status(404).json({ error: 'Transaction not found' });
		}



		// Return the transaction
		res.status(200).json({ transaction });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

const deleteTransactionById = async (req, res) => {
	try {
		const { id } = req.params;

		// Check if transaction exists
		const transaction = await Transaction.findById(id);

		if (!transaction) {
			return res.status(404).json({ error: 'Transaction not found' });
		}

		await Transaction.findByIdAndDelete(id);

		res.status(200).json({ message: 'Transaction deleted successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};


const getAllTransactions = async (req, res) => {
	
  
	try {
	const limit = req.query.limit ? parseInt(req.query.limit) : null; // Get limit from query parameter, if provided
	  let query = Transaction.find().populate({
		path: 'items.category',
		select: 'name categoryType quantity'
	  }).sort({ createdAt: -1 });
  
	  if (limit !== null && limit > 0) {
		query = query.limit(limit); // Apply limit if specified and greater than 0
	  }
  
	  const transactions = await query.exec();

	  // Calculate total count, this month's count, and today's count
	  const totalCount = transactions.length;
	  const todayStart = new Date();
	  todayStart.setHours(0, 0, 0, 0);
	  const thisMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
	  const thisMonthCount = transactions.filter(transaction => transaction.createdAt >= thisMonthStart).length;
	  const todayCount = transactions.filter(transaction => transaction.createdAt >= todayStart).length;
  
  
	  res.status(200).json({ transactions,  total: totalCount, monthly: thisMonthCount, daily: todayCount });
	} catch (error) {
	  console.error(error);
	  res.status(500).json({ error: 'Internal Server Error' });
	}
  };
  
const updateTransactionById = async (req, res) => {
	try {
		const { id } = req.params;
		const { items, grandTotal, customerName, deletedItems = [], builty, cnic, contact, transactionType, receiving } = req.body;

		const transaction = await Transaction.findById(id).populate({
			path: 'items.category',
			select: 'name categoryType quantity'
		});
		if (!transaction) {
			return res.status(404).json({ error: 'Transaction not found' });
		}

		const existingById = new Map(
			transaction.items.map((line) => [line._id.toString(), line])
		);
		const deltaByCategoryId = new Map();

		for (const item of items) {
			const categoryID = resolveCategoryId(item);
			if (!categoryID) {
				return res.status(404).json({ error: `Category for item ${item.name || 'unknown'} not found` });
			}

			const quantity = parseInt(item.quantity, 10) || 0;
			let updateQty;

			if (item._id !== undefined && item._id !== null) {
				const existing = existingById.get(item._id.toString());
				if (existing) {
					// old - new: positive restores stock, negative deducts more
					updateQty = parseInt(existing.quantity, 10) - quantity;
				} else {
					updateQty = -quantity;
				}
			} else {
				updateQty = -quantity;
			}

			addDelta(deltaByCategoryId, categoryID, updateQty);
			item.category = categoryID;
		}

		for (const delItemID of deletedItems || []) {
			const existing = existingById.get(delItemID?.toString?.() || String(delItemID));
			if (!existing) continue;

			const categoryID = resolveCategoryId(existing);
			const quantity = +existing.quantity || 0;
			if (!categoryID) {
				return res.status(404).json({ error: `Category for deleted item not found` });
			}
			addDelta(deltaByCategoryId, categoryID, quantity);
		}

		await applyCategoryStockDeltas(deltaByCategoryId);

		transaction.grandTotal = grandTotal;
		transaction.items = items;
		transaction.builty = builty;
		transaction.customerName = customerName;
		transaction.cnic = cnic;
		transaction.contact = contact;
		transaction.transactionType = transactionType;
		transaction.receiving = receiving;

		await transaction.save();
		res.status(201).json({ message: 'Transaction added successfully', transaction });
	} catch (error) {
		console.error(error);
		if (error.status) {
			return res.status(error.status).json({ error: error.message });
		}
		res.status(500).json({ error: 'Internal Server Error' });
	}
};
const getTransactionsByContact = async (req, res) => {
    try {
        const { contactNumber } = req.params;
		contactNumber?.replace(/\D/g, '');
		const regex = new RegExp(`^${contactNumber.replace(/(\d{4})(\d{7})/, '$1[- ]?$2')}$`, 'i');

        // Find transactions by contact number
        const transactions = await Transaction.find({ contact: { $regex: regex } }).populate({
            path: 'items.category',
            select: 'name categoryType quantity'
        }).sort({ createdAt: -1 });

        // Return the transactions
        res.status(200).json({ transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {
	addTransaction,
	getAllTransactions,
	deleteTransactionById,
	getTransactionById,
	updateTransactionById,
	getTransactionsByContact
};
