import {getTodosPosts, criarPost, atualizarPost, apagarPost} from "../models/postsModel.js";
import fs from "fs";
import gerarDescricaoComGemini from "../services/geminiService.js"

export async function listarPosts(req, res) {
    // Chama a função para buscar os posts
    const posts = await getTodosPosts();
    // Envia uma resposta HTTP com status 200 (OK) e os posts no formato JSON
    res.status(200).json(posts);
}

export async function postarNovoPost(req, res) {
    const novoPost = req.body;
    try {
        const postCriado = await criarPost(novoPost);
        res.status(200).json(postCriado);  
    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    }
}

export async function uploadImagem(req, res) {
    const novoPost = {
        descricao: "",
        imgUrl: req.file.originalname,
        alt: ""
    };

    try {
        const postCriado = await criarPost(novoPost);
        const imagemAtualizada = `uploads/${postCriado.insertedId}.png`
        fs.renameSync(req.file.path, imagemAtualizada)
        res.status(200).json(postCriado);  
    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"})
    }
}

export async function atualizarNovoPost(req, res) {
    const id = req.params.id;
    const urlImagem = `http://localhost:3000/${id}.png`
    try {
        const imgBuffer = fs.readFileSync(`uploads/${id}.png`)
        const descricao = await gerarDescricaoComGemini(imgBuffer)

        const post = {
            imgUrl: urlImagem,
            descricao: descricao,
            alt: req.body.alt
        }

        const postCriado = await atualizarPost(id, post);
        res.status(200).json(postCriado);  
    } catch(erro) {
        console.error(erro.message);
        res.status(500).json({"Erro":"Falha na requisição"});
    }
}

export async function deletarPost(req, res) {
    const postId = req.params.id;
    try{
        const deletedPost = await apagarPost(postId);
        if(deletedPost){
            res.status(200).json({message: "Foto excluída com sucesso."});
        }else{
            res.status(404).json({message: "Foto não encontrada. Não foi possível excluir a foto."});
        }
    }catch(error)
    {
        console.error(error);
        res.status(500).json({message: "Erro ao excluir a foto!"});
    }
}


async function deleteDocument(req, res) {
    const id = req.params.id;
  
    // ... validações básicas ...
  
    try {
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection('posts');
  
      // Verificar se o documento existe antes de deletar
      const existingDocument = await collection.findOne({ _id: ObjectId(id) });
  
      if (!existingDocument) {
        return res.status(404).json({ message: 'Document not found' });
      }
  
      const result = await collection.deleteOne({ _id: ObjectId(id) });
  
      // ... restante do código ...
    } catch (error) {
      // ... tratamento de erros ...
    }
  }