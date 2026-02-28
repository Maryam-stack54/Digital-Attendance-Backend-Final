 const express = require("express")

const mongoose = require("mongoose")

const staffSchema = new mongoose.Schema({


    // Basic info for HR $ Staffs
    firstName:{
        type: String,
        required: function () {
            return this.role !== "security"
        }
    },
    lastName:{
        type: String,
        required: function () {
            return this.role !== "security"
        }
    },

    //Email for staff & HR
    email:{
        type: String,
        required:  function () {
            return this.role !== "security"
        },
        unique: true
    },



    //login credentials for All users
    password:{
        type: String,
        required: true
    },

    staffId:{
        type: String,
        required: true,
        unique: true,
        required: function () {
            return this.role !== "security"
        },

    securityId: {
        type: String,
        unique: true,
        required: function (){
            return this.role == "security"
        }
    }
    }, 


    //optional info for staff and HR
    department: {
        type: String,
    },
    unit: { 
        type: String
    },


    //Role Based Access
    role: {
        type: String,
        enum:["staff", "hr", "security"],
        default: "staff"
      },


   //Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    changePassword:{
        type: Boolean,
        default: false
    }


}, 

{timestamps : true})

const staffModel = mongoose.model("Staff", staffSchema)

module.exports = staffModel
