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
        const { name, email, password, confirmPassword, role, phone, address } = req.body;

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
            role,
            phone,
            address
        });

        // Lưu người dùng vào cơ sở dữ liệu
        await newUser.save();
        console.log("Đăng ký thành công")
        //console.log(newUser);
        res.redirect('/users/login');
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
       // Lưu ID của người dùng vào cookie
       res.cookie('userId', user._id, { maxAge: 900000 });
       res.redirect('/');
    } catch (error) {
        next(error);
    }
});

router.get('/logout', function(req, res) {
    // Xóa cookie userId
    res.clearCookie('userId');
    res.redirect('/');
});

router.get('/profile', async function(req, res, next) {
    try {
        const userId = req.cookies.userId;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send("Không tìm thấy người dùng");
        }
        
        // Render trang thông tin cá nhân và truyền thông tin người dùng vào
        res.render('profile', { title: 'Thông tin cá nhân', user });
    } catch (error) {
        next(error);
    }
});



// Route để lấy thông tin người dùng từ userId
router.get('/:userId', async function(req, res, next) {
    try {
        const userId = req.cookies.userId; 
        // Truy vấn cơ sở dữ liệu để tìm người dùng với userId tương ứng
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        // Gửi thông tin người dùng về cho trình duyệt
        res.json(user);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
