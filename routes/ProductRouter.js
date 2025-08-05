import express from 'express';
import { addproperty, listproperty, removeproperty, updateproperty,singleproperty, getAdminProperties } from '../controller/productcontroller.js';
import upload from '../middleware/multer.js';
import { adminAuthMiddleware } from '../middleware/authmiddleware.js';

const propertyrouter = express.Router();

propertyrouter.post('/add', upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]),adminAuthMiddleware, addproperty);
propertyrouter.get('/admin/list', adminAuthMiddleware, getAdminProperties)
propertyrouter.get('/list', listproperty);
propertyrouter.post('/remove', removeproperty);
propertyrouter.post('/update', upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), updateproperty);
propertyrouter.get('/single/:id', singleproperty);

export default propertyrouter;