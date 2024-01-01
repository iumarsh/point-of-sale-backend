const Transaction = require('../model/Transaction');
const Category = require('../model/Category');
const addTransaction = async (req, res) => {
  try {
    const { items, grandTotal, customerName } = req.body;

    for (const item of items) {
      const { name, quantity } = item;

      // Retrieve the relevant category from the database
      const category = await Category.findOne({ name });

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
    });

    // Save the transaction to the database
    await newTransaction.save();

    res.status(201).json({ message: 'Transaction added successfully', newTransaction });
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
    const transactions = await Transaction.find();
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
};
