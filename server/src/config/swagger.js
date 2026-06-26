import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Review API',
      version: '0.2.0',
      description: 'Backend API for a Car Review Platform'
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 4000}`, description: 'Development server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            slug: { type: 'string' },
            title: { type: 'string' },
            excerpt: { type: 'string' },
            featured_image: { type: 'string' },
            manufacturer: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            rating: { type: 'number', minimum: 0, maximum: 5 },
            status: { type: 'string', enum: ['draft', 'published'] },
            featured: { type: 'boolean' },
            views: { type: 'integer' },
            published_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            review_id: { type: 'string', format: 'uuid' },
            author_name: { type: 'string' },
            author_email: { type: 'string' },
            body: { type: 'string' },
            status: { type: 'string', enum: ['approved', 'pending', 'spam'] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

export const swaggerSpec = swaggerJsdoc(options);
