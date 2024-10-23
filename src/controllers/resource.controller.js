import { Resource } from "../models/resources.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//contorller for creating a new resource 
const createResource = asyncHandler(async(req,res)=>{
    const {
        title,
        description,
        resourceType,
        subject,
        subjectCode,
        year, 
        tags,
        testName,
        teacherName 
      } = req.body;
    const uploadedBy=req.user._id;
      //upload files on cloudinary 
    if(!title){
        throw new ApiError(400,"Title is required ");
    }
    if(!description){
        throw new ApiError(400,"description is required ");
    }
    if(!resourceType){
        throw new ApiError(400,"resourceType is required ");
    }
    if(!subject){
        throw new ApiError(400,"subject is required ");
    }
    if(!subjectCode){
        throw new ApiError(400,"subject is required ");
    }
    const resourceFileLocalPath=req.files?.resourceFile?.[0]?.path;
    if(!resourceFileLocalPath){
        throw new ApiError(400,"Resource file is required ");
    }
    const resourceFile=await uploadOnCloudinary(resourceFileLocalPath);
    if(!resourceFile){
        throw new ApiError(500,"Error while uploading Resource file to Cloudinary ");
    }
    if(resourceType === 'Question Paper' || resourceType === 'Solution'){
        if(!year){
            throw new ApiError(500,"Year is required for solutions and question papers ");
        }
        if(!testName){
            throw new ApiError(500,"testName is required for solutions and question papers ");
        }
    }
    const resourceCreated = await Resource.create({
        title,
        description,
        resourceType,
        subject,
        subjectCode,
        year, 
        tags,
        testName,
        teacherName,
        fileUrl:{
            url:resourceFile.secure_url,
            public_id:resourceFile.public_id
        },
        uploadedBy:req.user._id
    })
    console.log("created a resource ");
    return res
        .status(201)
        .json(new ApiResponse(201,resourceCreated,"Created resource Succesfully"));

});

export{createResource};