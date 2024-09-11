import axios from "axios";
// const baseUrl = "http://localhost:3001/persons";

// Integrating frontend with backend
// const baseUrl = "http://localhost:3001/api/persons"
const baseUrl = "/api/persons"


const getAll = async () => {
    const request = axios.get(baseUrl);
    return request.then((response) => response.data);
}

const create = async (newObject) => {
    const request = axios.post(baseUrl, newObject);
    return request.then((response) => response.data);
}  

const update = (id, newObject) => {
    const request = axios.put(`${baseUrl}/${id}`, newObject);
    return request.then((response) => response.data);
}

const remove = async (id) => {
    const request = axios.delete(`${baseUrl}/${id}`);
    return request.then((response) => response.data);
}
export default {
    getAll, 
    create,
    remove,
    update,
}