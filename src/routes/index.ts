import express from 'express'
import FilesController from '../controllers/FilesController'
import PostsController from '../controllers/PostsController'
import SessionController from '../controllers/SessionController'
import UsersController from '../controllers/UsersController'

import authMiddleware from '../middlewares/auth'
import multerMiddleware from '../middlewares/multer'

const router = express.Router()

/**
 * Public routes
 */
router.post('/users', UsersController.store)
router.post('/sessions', SessionController.store)
router.get('/file/:path', FilesController.index)

/**
 * Private routes above auth middleware
 */
router.use(authMiddleware);

router.get('/posts/:id', PostsController.index)
router.get('/posts', PostsController.list)
router.post('/posts', PostsController.store)
router.delete('/posts/:id', PostsController.destroy)
// Repass auth middleware to get id from token
router.put('/posts/:id/image', multerMiddleware.single('image'), authMiddleware, PostsController.imageUpdate)

router.put('/posts/like/:id', PostsController.like)
router.delete('/posts/like/:id', PostsController.unlike)

router.get('/users/:id', UsersController.index)
router.get('/users', UsersController.list)
router.put('/users', UsersController.update)
router.delete('/users/:id', UsersController.destroy)
// Repass auth middleware to get id from token
router.put('/users/avatar', multerMiddleware.single('avatar'), authMiddleware, UsersController.avatarUpdate)


export default router