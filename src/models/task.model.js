import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TaskSchema = new mongoose.Schema({
  
  _id: {
    type: String,
    default: () => uuidv4()
  },
  title: String,
  description: String,
  completed_at: Date,
  created_at: {type: Date, default: Date.now},
  updated_at: Date

}, { versionKey: false});

TaskSchema.virtual('id').get(function(){
  return this._id;
});

TaskSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret, options) {
    delete ret._id;
    return ret;
  }

});

const Task = mongoose.model('Task', TaskSchema);


export default Task;