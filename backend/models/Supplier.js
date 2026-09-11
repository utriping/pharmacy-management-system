const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact_info: { type: String },
    address: { type: String }
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

module.exports = mongoose.model('Supplier', supplierSchema);
