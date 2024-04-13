const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const bcrypt = require('bcrypt');

// Route để hiển thị tất cả người dùng
router.get('/', async function(req, res) {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route để hiển thị thông tin của một người dùng dựa trên id
router.get('/:id', async function(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route để cập nhật thông tin của một người dùng dựa trên id
router.put('/:id', async function(req, res) {
    try {
        const { name, email, phone, address } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { name, email, phone, address }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route để xóa một người dùng dựa trên id
router.delete('/:id', async function(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route để xử lý yêu cầu đăng ký
router.post('/register', async function(req, res, next) {
    try {
        const { name, email, password, confirmPassword, phone, address } = req.body;

        // Kiểm tra xem mật khẩu và xác nhận mật khẩu có khớp nhau không
        if (password !== confirmPassword) {
            return res.status(400).send("Passwords don't match");
        }

        // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Email already exists");
        }

        // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo một người dùng mới
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address
        });

        // Lưu người dùng vào cơ sở dữ liệu
        await newUser.save();

        res.status(201).send("User registered successfully");
    } catch (error) {
        next(error);
    }
});

module.exports = router;
