var mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
},{timestamps:true});

categorySchema.virtual('published',{
    ref:"product",
    localField:'_id',
    foreignField:'category'
})
categorySchema.set('toJSON',{virtuals:true})
categorySchema.set('toObject',{virtuals:true})

module.exports = new mongoose.model('categories',categorySchema)
//tao bang books trong db