import {Request, Response}from 'express'
import Restaurant from '../model/restaurants';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

const createMyRestaurant = async(req:Request, res: Response) => {
    try {
        // Verificar si el restaurante del usuario ya existe
        const existingRestaurant = await Restaurant.findOneAndReplace({ user: req.userId });
        
        // Si existe, devolver un mensaje de error
        if(existingRestaurant){
            return res.status(409).json({ message: "¡Ups! ¡Ya tienes un restaurante registrado!" });
        }
        
        // Obtener la imagen subida por el usuario
        const image = req.file as Express.Multer.File;
        // Convertir la imagen a base64 para almacenarla
        const base64Image = Buffer.from(image.buffer).toString('base64');
        const dataURL = `data:${image.mimetype};base64,${base64Image}`;

        // Subir la imagen a Cloudinary para su almacenamiento
        const uploadResponse = await cloudinary.v2.uploader.upload(dataURL);

        // Crear un nuevo restaurante con los datos recibidos
        const restaurant = new Restaurant(req.body);

        // Asignar la URL de la imagen subida al restaurante
        restaurant.imageUrl = uploadResponse.url;

        // Asignar el ID del usuario al restaurante
        restaurant.user = new mongoose.Types.ObjectId(req.userId);
        
        // Guardar el restaurante en la base de datos
        await restaurant.save();

        // Devolver el restaurante creado con el código de estado 201 (creado exitosamente)
        res.status(201).send(restaurant);

    } catch (error) {
        // Manejar cualquier error que ocurra durante el proceso
        console.log(error)
        res.status(500).json({ message: "¡Ups! Algo salió mal en el servidor" });
    }
}


export default {
    createMyRestaurant,
}