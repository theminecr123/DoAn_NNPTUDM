//users
const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
var bcrypt = require('bcryptjs');




router.get('/', async function(req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/register', function(req, res) {
    res.render('register', { title: 'Register' });
});

router.post('/register', async function(req, res, next) {
    try {
        const { name, email, password, confirmPassword, phone, address } = req.body;

        // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp nhau không
        if (password !== confirmPassword) {
            return res.status(400).send("Mật khẩu và xác nhận mật khẩu không khớp");
        }

        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Email đã tồn tại");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address
        });

        // Lưu người dùng vào cơ sở dữ liệu
        await newUser.save();
        console.log("Đăng ký thành công")
        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

router.get('/login', function(req, res) {
    res.render('login', { title: 'Login' });
});

router.post('/login', async function(req, res, next) {
    try {
        const { email, password } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("Email not found");
        }

        // So sánh mật khẩu đã nhập với mật khẩu đã lưu trữ
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).send("Incorrect password");
        }

        // Đăng nhập thành công
        // Thiết lập session cho người dùng
        req.session.user = user;
        console.log(user);

        res.redirect('/');
    } catch (error) {
        next(error);
    }
});

router.get('/logout', function(req, res) {
    // Xóa session người dùng khi đăng xuất
    req.session.destroy(function(err) {
        if (err) {
            return res.status(500).send("Error logging out");
        }
        res.redirect('/');
    });
});


module.exports = router;
