import express from 'express'
import PostsController from '../controllers/PostsController'
import SessionController from '../controllers/SessionController'
import UsersController from '../controllers/UsersController'

import authMiddleware from '../middlewares/auth'

const router = express.Router()

/**
 * Public routes
 */
router.post('/users', UsersController.store)
router.post('/sessions', SessionController.store)

/**
 * Private routes above auth middleware
 */
router.use(authMiddleware);

router.get('/posts/:id', PostsController.index)
router.get('/posts', PostsController.list)
router.post('/posts', PostsController.store)
router.put('/posts/:id', PostsController.update)
router.delete('/posts/:id', PostsController.destroy)

router.put('/posts/like/:id', PostsController.like)
router.delete('/posts/like/:id', PostsController.unlike)

router.get('/users/:id', UsersController.index)
router.get('/users', UsersController.list)
router.put('/users', UsersController.update)
router.delete('/users/:id', UsersController.destroy)

export default router