import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    /** String */
    title: { type: String, required: true, trim: true },
    desc: String,
    slug: { type: String, required: true, trim: true },  /** @todo make the slug in lowercase */
    folderId: { type: String, required: true , unique: true},


    /** Number */
    basePrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    appliedPrice: { type: Number, required: true },
    stock: { type: Number, required: true, min: 1 },
    rate: { type: Number, default: 0, min: 0, max: 5 },

    /** Arrays */
    images: [{
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true ,unique: true}
    }],

    /** Objects(Map)*/
    specs: {
        type: Map,
        of: [String | Number]
    },

    /** ObjectIds */
    addedBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    categoryId: { type: mongoose.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: mongoose.Types.ObjectId, ref: 'SubCategory', required: true },
    brandId: { type: mongoose.Types.ObjectId, ref: 'Brand', required: true },

}, { timestamps: true });

const Product= mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product

