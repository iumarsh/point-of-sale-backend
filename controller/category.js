const Category = require('../model/Category'); 
const Transaction = require('../model/Transaction');

const addCategory = async (req, res) =>{
    try {
        const { name, categoryType, quantity, additionalInfo, price } = req.body;
  
        // Check if category with the same name already exists
        const existingCategory = await Category.findOne({ name });
  
        if (existingCategory) {
          return res.status(400).json({ error: 'Category with this name already exists' });
        }
  
        const newCategory = new Category({ name, categoryType, quantity, additionalInfo, price });
        await newCategory.save();
  
        res.status(201).json({ message: 'Category added successfully', newCategory });
      } catch (error) {
          console.log('error: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  
}
const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryType, quantity, additionalInfo, price } = req.body;

    // Check if category exists
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update category fields
    category.name = name;
    category.categoryType = categoryType;
    category.quantity = quantity;
    category.additionalInfo = additionalInfo;
    category.price = price;

    await category.save();

    res.status(200).json({ message: 'Category updated successfully', updatedCategory: category });
  } catch (error) {
    console.log('error: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const deleteCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
  
        // Check if category exists
        const category = await Category.findById(id);
  
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        // Update transactions referencing the deleted category
        await Transaction.updateMany(
          { 'items.category': id },
          { $set: { 'items.$[elem].category': null } },
          { arrayFilters: [{ 'elem.category': id }] }
      );


        // Delete the category
        await Category.findByIdAndDelete(id);

  
        res.status(200).json({ message: 'Category deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: `${error?.message} Internal Server Error` });
      }
}

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });;
        res.status(200).json({ categories });
      } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
}


module.exports = {
    addCategory,
    getAllCategories,
    deleteCategoryById,
    updateCategoryById
  };