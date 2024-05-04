import { Request, Response } from 'express'
import Restaurant from '../model/restaurants';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

const createMyRestaurant = async (req: Request, res: Response) => {
    try {
        // Verificar si el restaurante del usuario ya existe
        const existingRestaurant = await Restaurant.findOne({ user: req.userId });

        // Si existe, devolver un mensaje de error
        if (existingRestaurant) {
            return res.status(409).json({ message: "¡Ups! ¡Ya tienes un restaurante registrado!" });
        }

        const imgeUrl = await uploadImage(req.file as Express.Multer.File);
        const restaurant = new Restaurant(req.body);

        // Asignar la URL de la imagen subida al restaurante
        restaurant.imageUrl = imgeUrl;
        restaurant.lastUpdated = new Date();
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


const getMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ user: req.userId });

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found." })
        }

        res.json(restaurant);

    } catch (error) {
        console.log("Error", error);
        res.status(500).json({ message: "Error fetching restaurant." });
    }
}

const updateMyRestaurant = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({
            user: req.userId,
        });

        if (!restaurant) {
            return res.status(404).json({ message: "restaurant not found." });
        }

        restaurant.restaurantName = req.body.restaurantName;
        restaurant.city = req.body.city;
        restaurant.country = req.body.country;
        restaurant.deliveryPrice = req.body.deliveryPrice;
        restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
        restaurant.cuisines = req.body.cuisines;
        restaurant.menuItems = req.body.menuItems;
        restaurant.lastUpdated = new Date();

        if (req.file) {
            const imgeUrl = await uploadImage(req.file as Express.Multer.File);
            restaurant.imageUrl = imgeUrl;
        }

        await restaurant.save();
        res.status(200).send(restaurant);



    } catch (error) {
        console.log("Error", error);
        res.status(500).json({ message: "Error fetching restaurant." });
    }
}


const uploadImage = async (file: Express.Multer.File) => {
    // Obtener la imagen subida por el usuario
    const image = file;
    // Convertir la imagen a base64 para almacenarla
    const base64Image = Buffer.from(image.buffer).toString('base64');
    const dataURL = `data:${image.mimetype};base64,${base64Image}`;

    const uploadResponse = await cloudinary.v2.uploader.upload(dataURL);
    return uploadResponse.url;
}

export default {
    createMyRestaurant,
    getMyRestaurant,
    updateMyRestaurant,

}