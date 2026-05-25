// routes/taskRoutes.js

const express = require('express');
const router = express.Router(); 
const { moveTask, updateTask, deleteTask, addTaskComment,  toggleTimer, getTasks, uploadtaskFile, deleteTaskFile } = require('../controller/taskController');
const { protect } = require('../middleware/authMiddleware');
const multer=require('multer')
const path=require('path')

const storage=multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'uploads/')
    },
    filename: (req, file, cb)=>{
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload=multer({storage})

router.patch('/:taskId/move', protect, moveTask);
router.patch("/:taskId", protect, updateTask)
router.delete("/:taskId", protect, deleteTask)
router.post('/:taskId/comments', upload.array('files'), protect, addTaskComment)
router.post('/:taskId/timer',protect, toggleTimer)
router.post('/:taskId/upload',protect, upload.array('files'), uploadtaskFile)
router.get('/', protect, getTasks);
router.delete('/:taskId/upload/:fileId', protect, deleteTaskFile)
module.exports = router;