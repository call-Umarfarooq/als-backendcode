import mongoose from 'mongoose'
const connectMongoDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB start now')
    } catch (error) {
        console.error(`Error:${error.message}`)
        process.exit(1)
    }
}
export default connectMongoDB