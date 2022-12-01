const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Posts = require('../schemas/post.js');
const Comments = require('../schemas/comment.js');

// 게시글 작성
router.post('/', async (req, res) => {
    const { user, password, title, content } = req.body;

    if(!(user && password && title && content))
        return res.status(400).json({ 'message': '데이터 형식이 올바르지 않습니다.' });
    
    await Posts.create({user, password, title, content});

    return res.status(201).json({ 'message': '게시글을 생성하였습니다.' });
});

//전체 게시글 조회
router.get('/', async (req, res) => {
    const posts = await Posts.find({}, { 'password': 0, 'content': 0 }).sort({'createdAt': -1});

    const postsConvert = posts.map(value => {
        return {
            "postId": value._id,
            "user": value.user,
            "title": value.title,
            "createdAt": value.createdAt,
        }
    });
    
    return res.status(200).json({'data': postsConvert});
});

//게시글 상세 조회
router.get('/:_postId', async (req, res) => {
    
    try {
        const { _postId } = req.params;

        const detailPost = await Posts.find({'_id': _postId}, {'password': 0, 'comments': 0 });

        if(!detailPost) {
            return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다..'});
        }

        const detailConvert = detailPost.map((value) => {
            return {
                'postId': value._id,
                'user': value.user,
                'title': value.title,
                'content': value.content,
                'createdAt': value.createdAt,
            }
        });

        return res.status(200).json({'data': detailConvert});
    
    } catch (err) {

        return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});

    }
});

//게시글 수정
router.put('/:_postId', async (req, res) => {
    
    try {

        const { _postId } = req.params;
        const editedPost = req.body;
        const { password, title, content } = req.body;

        const existPost = await Posts.findOne({'_id': _postId});

        if(!existPost) {
            return res.status(404).json({ 'message': '게시글 조회에 실패하였습니다.'});
        }

        const isValidBody = Object.values(editedPost).filter( v => !v.trim()).length;

        if(Object.keys(editedPost).length !== 3 || isValidBody || password !== existPost.password) {
            return res.status(400).json({ 'message': '데이터 형식이 올바르지 않습니다.' });
        }
        
        await Posts.updateOne({'_id': _postId}, {'$set': { title, content}});

        return res.status(201).json({'message': '게시글을 수정하였습니다.'});
    
    } catch (err) {
    
        return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});

    }    

});

//게시물 삭제 
router.delete('/:_postId', async (req, res) => {
    
    try {
        const { _postId } = req.params;
        const { password } = req.body;

        const existPost = await Posts.findOne({'_id': ObjectId(_postId)});

        if(!existPost) {
            return res.status(404).json({'message': '게시글 조회에 실패하였습니다.'});
        }

        if(Object.keys(req.body).length !== 1 || !password || password != existPost.password) {
            return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});
        }

        await Posts.deleteOne({'_id': _postId});
        await Comments.deleteMany({'postId': _postId});

        return res.status(200).json({'message': '게시글을 삭제하였습니다.'});
    
    } catch (err) {

        return res.status(400).json({'message': '데이터 형식이 올바르지 않습니다.'});

    }    

});

module.exports = router;