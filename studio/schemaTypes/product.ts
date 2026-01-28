export default {
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule: any) => Rule.required()
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule: any) => Rule.required()
        },
        {
            name: 'price',
            title: 'Price (GH₵)',
            type: 'number',
            validation: (Rule: any) => Rule.required().min(0)
        },
        {
            name: 'quantity',
            title: 'Quantity',
            type: 'number',
            validation: (Rule: any) => Rule.required().min(0)
        },
        {
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }]
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
        },
        {
            name: 'image',
            title: 'Main Image',
            type: 'image',
            options: {
                hotspot: true,
            }
        },
        {
            name: 'icon',
            title: 'Icon (Emoji)',
            type: 'string',
            description: 'Optional emoji identifier',
        },
        {
            name: 'variants',
            title: 'Variants',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'name', type: 'string', title: 'Variant Name' },
                        { name: 'image', type: 'image', title: 'Variant Image', options: { hotspot: true } }
                    ]
                }
            ]
        }
    ]
}
