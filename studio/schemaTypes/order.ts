export default {
    name: 'order',
    title: 'Order',
    type: 'document',
    fields: [
        {
            name: 'customerName',
            title: 'Customer Name',
            type: 'string',
            validation: (Rule: any) => Rule.required()
        },
        {
            name: 'phone',
            title: 'Phone Number',
            type: 'string',
            validation: (Rule: any) => Rule.required()
        },
        {
            name: 'email',
            title: 'Email',
            type: 'string',
        },
        {
            name: 'products',
            title: 'Products',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        {
                            name: 'product',
                            title: 'Product',
                            type: 'reference',
                            to: [{ type: 'product' }]
                        },
                        {
                            name: 'quantity',
                            title: 'Quantity',
                            type: 'number',
                            validation: (Rule: any) => Rule.required().min(1)
                        }
                    ],
                    preview: {
                        select: {
                            titulo: 'product.name',
                            cantidad: 'quantity',
                            media: 'product.image'
                        },
                        prepare({ titulo, cantidad, media }: any) {
                            return {
                                title: titulo,
                                subtitle: `Quantity: ${cantidad}`,
                                media
                            }
                        }
                    }
                }
            ]
        },
        {
            name: 'totalPrice',
            title: 'Total Price',
            type: 'number',
            validation: (Rule: any) => Rule.required().min(0)
        },
        {
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Pending', value: 'pending' },
                    { title: 'Processing', value: 'processing' },
                    { title: 'Delivered', value: 'delivered' },
                    { title: 'Cancelled', value: 'cancelled' }
                ],
                layout: 'radio'
            },
            initialValue: 'pending'
        },
        {
            name: 'orderDate',
            title: 'Order Date',
            type: 'datetime',
            initialValue: () => new Date().toISOString()
        }
    ]
}
