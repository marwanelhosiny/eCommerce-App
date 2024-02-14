import { Schema, model } from "mongoose";

const brandSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true },
        folderId: { type: String, required: true, unique: true }
    },
    subCategoryId:{type: Schema.Types.ObjectId,ref:"subCategory"},
    categoryId:{type: Schema.Types.ObjectId, ref :"category"},
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Admin
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // Admin

},{timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }});

brandSchema.virtual('products',{
    ref: 'Product',
    localField: '_id',
    foreignField: 'brandId'
}) 

const Brand = model('brand', brandSchema);

export default Brand;