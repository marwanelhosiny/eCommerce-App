
export class ApiFeatures {

    constructor(query , mongooseQuery){
        this.query = query;
        this.mongooseQuery = mongooseQuery;
    }

    pagination({page = 1 , size = 2}){
        if( page<0)page = 1
        if( size<0)size = 2
    
        const limit = +size
        const skip =  +(page -1) * limit

        this.mongooseQuery.limit( limit ).skip( skip )
    
        return this
    }

    sort(sortBy){
        if(!sortBy){
            this.mongooseQuery = this.mongooseQuery.sort({ createdAt: 1 })
            return this
        }
        const order = sortBy.split( ' ' )
        const key = order[0]
        const value = order[1]
        console.log(key , value)
        this.mongooseQuery.sort({[key]: value})

        return this
    }

    search(search) {
        const querySearch = {}
        
        if (search.title) querySearch.title = { $regex: search.title, $options: 'i' }
        if (search.desc) querySearch.desc = { $regex: search.desc, $options: 'i' }
        if (search.discount) querySearch.discount = { $gte: search.discount }
        if (search.priceFrom && !search.priceTo) querySearch.appliedPrice = { $gte: search.priceFrom }
        if (search.priceTo && !search.priceFrom) querySearch.appliedPrice = { $lte: search.priceTo }
        if (search.priceTo && search.priceFrom) querySearch.appliedPrice = { $gte: search.priceFrom, $lte: search.priceTo }
        if (search.stock) querySearch.discount = { $gte: search.stock }
        if(search.colors) {
            querySearch[`specs.colors`] = search.colors}
        if(search.size) {
            querySearch[`specs.size`] = +search.size}

        this.mongooseQuery.find(querySearch)
        return this
    }

    filter(filter){
        const queryFilter = JSON.stringify(filter).replace(/gte|gt|lte|lt|eq|ne|in|min/g,(operator) => `$${operator}`)
        console.log(JSON.parse(queryFilter))
        this.mongooseQuery.find(JSON.parse(queryFilter))
        return this
    }
    
}