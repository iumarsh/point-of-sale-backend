const Transaction = require('../model/Transaction');
const Category = require('../model/Category');
const addTransaction = async (req, res) => {
	try {
		const { items, grandTotal, customerName, builty, cnic, contact } = req.body;

		for (const item of items) {
			const { name, quantity } = item;

			// Retrieve the relevant category from the database
			const category = await Category.findOne({ name }); //id

			if (!category) {
				return res.status(404).json({ error: `Category for item ${name} not found` });
			}
			if (category.quantity < quantity) {
				return res.status(500).json({ error: `Insufficient quantity for item ${name}` });
			}

			// Update the category quantity based on the quantity in the items
			category.quantity -= quantity;

			// Save the updated category to the database
			await category.save();
		}

		// Create a new transaction instance
		const newTransaction = new Transaction({
			items,
			grandTotal,
			customerName,
			builty,
			cnic,
			contact
		});

		// Save the transaction to the database
		await newTransaction.save();

		res.status(201).json({ message: 'Transaction added successfully', transaction: newTransaction });
	} catch (error) {
		console.error(error);
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
		const transactions = await Transaction.find().populate({
			path: 'items.category',
			select: 'name categoryType quantity'
		}).sort({ createdAt: -1 });
		//explicit tell to fetch the data.
		res.status(200).json({ transactions });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal Server Error' });
	}
};

const updateTransactionById = async (req, res) => {
	try {
		const { id } = req.params;
		const { items, grandTotal, customerName, deletedItems, builty, cnic, contact } = req.body;


		// Check if transaction exists
		const transaction = await Transaction.findById(id).populate({
			path: 'items.category',
			select: 'name categoryType quantity'
		});
		// console.log(transaction);
		if (!transaction) {
			return res.status(404).json({ error: 'Transaction not found' });
		}

		for (const item of items) {
			const { _id, name, quantity } = item;
			console.log(item, "item")

			let categoryID;
			if (_id !== undefined && _id !== null) categoryID = item.category._id;
			else categoryID = item.category;

			let updateQty;
			let t;
			if (_id !== undefined && _id !== null) {
				const f = transaction.items.filter(
					(d) => {
						console.log(d, "d")
						return d._id.toString() === _id.toString()
					}
				)
				console.log("129", _id, "_id");
				console.log("130", transaction.items, "transaction.items");
				console.log("131", f, "f");
				if (f.length) {
					t = f[0]
					updateQty = parseInt(t.quantity) - parseInt(quantity)
				}
			}
			else {
				updateQty = -(quantity)
			}

			console.log("141", t, "t");

			// Retrieve the relevant category from the database
			// const category = await Category.findById(t._id); //t.category._id or t._id // id
			const category = await Category.findById(categoryID); //id

			if (!category) {
				return res.status(404).json({ error: `Category for item ${category.name} not found` });
			}

			// quantity greater than before
			//  -5 < 0 && 10 < 15
			//  -5 < 0 && 20 < 15
			if (updateQty < 0 && category.quantity < quantity) {
				return res.status(500).json({ error: `Insufficient quantity for item ${name}` });
			}

			category.quantity = category.quantity + (updateQty)

			// Update the category quantity based on the quantity in the items
			// category.quantity -= quantity;

			// Save the updated category to the database
			await category.save();
			item.category = categoryID;
			// items.push(item);
		}

		for (const delItemID of deletedItems) {

			const f = transaction.items.filter((d) => { return d._id.toString() === delItemID })
			let t = f[0]
			let categoryID = t.category._id
			let quantity = +t.quantity

			// Retrieve the relevant category from the database
			const category = await Category.findById(categoryID); //id

			if (!category) {
				return res.status(404).json({ error: `Category for item ${category.name} not found` });
			}

			// Update the category quantity based on the quantity in the items
			category.quantity += quantity;

			// Save the updated category to the database
			await category.save();
			// items.push(item);
		}
		// update transaction

		transaction.grandTotal = grandTotal;
		transaction.items = items;
		transaction.builty = builty;
		transaction.customerName = customerName;
		transaction.cnic = cnic;
		transaction.contact = contact;

		// Save the transaction to the database
		await transaction.save();
		res.status(201).json({ message: 'Transaction added successfully', transaction });
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
	updateTransactionById
};
