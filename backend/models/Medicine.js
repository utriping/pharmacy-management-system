const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    generic_name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    price: { type: Number, required: true },
    stock_quantity: { type: Number, required: true, default: 0 },
    expiry_date: { type: Date, required: true }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            return ret;
        }
    }
});

module.exports = mongoose.model('Medicine', medicineSchema);
