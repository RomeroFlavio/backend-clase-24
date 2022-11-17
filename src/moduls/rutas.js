const products = require('../class/Products');
const express = require('express');
const multer = require('multer');
const { Router } = express;
const router = Router();
const path = require('path');
const { generarProducto } = require('./generarProducto');

const user = [{id: 0, user: 'admin', admin: true}];

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    res.render('formulario');
});
router.get('/productos', (req, res) => {
    products.getAll().then(date => {
        if(date.length!==0){
            date.forEach(element => res.render('productos', {element}));
        }else
            res.render('productos', {message:'No hay productos'});
    });
});
router.post('/productos', upload.single('myfile'), (req, res, next) => {
    const file = req.file;
    console.log(file)
    if(!file) {
        const err = new Error('No cargo el archivo,');
        err.httpStatusCode = 400;
        return next(err);
    }
    const { title, price } = req.body;
    const product = {
        title: title,
        price: price,
        thumbnail: file.path
    }
    products.addProdutcs(product);
    res.redirect('/');
});
router.get('/productos-test', (req, res) => {
    const allProducts = generarProducto();
    products.addProdutcs(allProducts);
    res.json(generarProducto());
});
router.post('/login', (req, res) => {
    const { user } = req.body;
    if(user !== 'admin'){
        return res.render('formulario', {error: 'El usuario no existe!'});
    }
    req.session.user = user;
    req.session.admin = true;
    res.cookie('login', user, {signed:true, maxAge:50000});
    res.render('formulario', {login: true, user: req.session.user})
})
router.get('/logout', (req, res) => {
    let user = req.session.user;
    req.session.destroy(err => {
        if(err) return res.send(err);
        res.render('logout', {user: user});
    });
})

module.exports = router;