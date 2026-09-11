const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
    medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true }
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
    supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    total_amount: { type: Number, required: true },
    purchase_date: { type: Date, default: Date.now },
    items: [purchaseItemSchema]
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

module.exports = mongoose.model('Purchase', purchaseSchema);
