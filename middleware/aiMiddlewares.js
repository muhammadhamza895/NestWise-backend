export const webCrawlerurlGenerator = (req, res, next) => {
    try {
        const {
            city,
            purpose,
            maxPrice,
            propertyCategory,
            propertyType,
            area,
            beds,
            baths,
        } = req.body

        const buyCategory = {
            Homes: { House: 'Houses_Property', Flat: 'Flats_Apartments', Penthouse: 'Penthouse' },
            Plots: { Residential_Plots: 'Residential_Plots', Commercial_Plots: 'Commercial_Plots' },
            Commercial: { Retail_Shops: 'Retail_Shops', Offices: 'Offices' }
        }
        const rentialCategory = {
            Homes: { House: 'Rentals_Houses_Property', Flat: 'Rentals_Flats_Apartments', Penthouse: 'Rentals_Penthouse' },
            Plots: { Residential_Plots: 'Rentals_Residential_Plots', Commercial_Plots: 'Rentals_Commercial_Plots' },
            Commercial: { Retail_Shops: 'Rentals_Retail_Shops', Offices: 'Rentals_Offices' }
        }

        const queryParams = []
        if (maxPrice) queryParams.push(`price_max=${maxPrice}`)
        if (area) queryParams.push(`area_max=${area}`)
        if (propertyCategory == 'Homes') {
            if (baths) queryParams.push(`baths_in=${baths}`)
            if (beds) queryParams.push(`beds_in=${beds}`)
        }

        let query = ''
        if (queryParams?.length) query = '?' + queryParams?.join('&')

        const category = purpose == 'Buy' ? buyCategory[propertyCategory][propertyType] : rentialCategory[propertyCategory][propertyType]

        // const url = `https://www.zameen.com/${category}/Karachi-2-1.html` + query
        const url = `https://www.zameen.com/${category}/${city}-1.html` + query
        req.zameen_url = url

        // return res.json({url, properties:[]});
        next()
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}


export const trendUrlGenerator = (req, res, next) => {
    try {
        const { purpose = 'Buy',
            city
        } = req.params;

        if (!city) {
            return res.status(400).json({ success: false, message: 'City parameter is required' });
        }

        let url = 'https://www.zameen.com/trends'

        if (purpose == 'Buy') url += `/buying-properties-${city}`
        else url += `/renting-properties-${city}`

        console.log({url})

        req.zameen_url = url
        next()
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", success: false });
    }
}
