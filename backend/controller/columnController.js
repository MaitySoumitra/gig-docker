const Board=require('../models/Board')
const Column=require('../models/Column');
const Task = require('../models/Task');

const  createColumn= async(req, res)=>{
    const boardId=req.params.boardId;
    const {name}=req.body;
    try{
        const board=await Board.findById(boardId, 'members');
        if(!board){
            return res.status(404).json({message: "Board Not found"});
        }
       const isMember = board.members.some(member => member._id.toString() === req.user._id.toString())
        if(!isMember){
            return res.status(403).json({message: "Access Denied: You must be Member to Modify this board."})
        }
        const newColumn=new Column({
            name,
            board:boardId,
            
        })
        await newColumn.save()

        await Board.findByIdAndUpdate(
            boardId,
            { $push: {columns: newColumn._id}},
        )
        res.status(201).json(newColumn)
    }
    catch(error){
        console.error(`Error creating Column for Board ${boardId}`, error);
        if(error.name==='CastError'){
            return res.status(400).json({message: 'Invalid Board ID format'})
        }
        return res.status(500).json({message: 'Server error: failedto create column '})
    }
}
const deleteColumn=async(req, res)=>{
    const {columnId}=req.params
    try{
        const column=await Column.findById(columnId)
        if(!column) return res.status(404).json({message: "Column is not found"})

        const board=await Board.findById(column.board).select('members')
        if(!board) return res.status(404).json({ message:"Board not found"})
        const isMember=board.members.some(member=>member._id.toString()===req.user._id.toString())
        if(!isMember) return res.status(403).json({message:"Deleteing Column has not access " })
        
        await Board.findByIdAndUpdate(column.board, {
            $pull: {columns: columnId}
        })
        await Task.deleteMany({column: columnId})

        await Column.findByIdAndDelete(columnId)
        res.status(200).json({message:"Deleted column successfully"})
    }
    catch(error){
        console.log("something went wrong", error)
        return res.status(500).json({message: "Internal server error"})
    }
}
const getColumns = async (req, res) => {
  try {
    const columns = await Column.find({ board: req.params.boardId });
    res.status(200).json(columns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching columns" });
  }
};

module.exports= {createColumn,  deleteColumn, getColumns}