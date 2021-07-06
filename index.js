const express = require('express')
const app = express()
const cors = require('cors')
const PORT = 3001
const fs = require('fs')
const path = require('path')
const pathToFile = path.resolve("./data.json")


const corsOptions = {
    origin: 'http://localhost:3000',
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))

const getResources = () => JSON.parse(fs.readFileSync(pathToFile))

app.use(express.json())

app.get('/',(req, res) => {
    res.send('Hello World')
})

app.get('/api/resources', (req, res) => {
    const resources = getResources()
    res.send(resources)
})

app.get('/api/activeresource', (req, res) => {
    const resources = getResources()
    const activeResource = resources.find((resource) => resource.status === 'active')
    res.send(activeResource)
})

app.get('/api/resources/:id', (req, res) => {
    const resources = getResources()
    const { id } = req.params;
    const resource = resources.find((res) => res.id === id)
    res.send(resource)
})

app.patch('/api/resources/:id', (req, res) => {
    const resources = getResources()
    const { id } = req.params;
    const index = resources.findIndex((res) => res.id === id)
    const activeResource = resources.find((resource) => resource.status === 'active')
    
    if(resources[index].status === 'complete'){
        return res.status(422).send('Cannot update because resource has been completed')
    }


    resources[index] = req.body
    // active resource related functionality
    if(req.body.status === 'active'){
        if(activeResource){
            return res.status(422).send("There is active resource already!")
        }
        resources[index].status = 'active'
        resources[index].activationTime = new Date()
    }
    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if(error){
            return res.status(422).send('Cannot store data in the file!')
        }
        return res.send('Data has been updated')
    })
})

app.post('/api/resources', (req, res) => {
    const resources = getResources()
    const resource = req.body
    resource.createdAt = new Date()
    resource.status = "inactive"
    resource.id = Date.now().toString()
    resources.unshift(resource)

    fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
        if(error){
            return res.status(422).send('Cannot store data in the file!')
        }
        return res.send('Data has been saved')
    })
})

app.listen(PORT, () => {
    console.log('this app is running on port 3001')
})