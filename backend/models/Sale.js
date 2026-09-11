const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true }
}, { _id: false });

const saleSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    total_amount: { type: Number, required: true },
    sale_date: { type: Date, default: Date.now },
    items: [saleItemSchema]
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

module.exports = mongoose.model('Sale', saleSchema);
