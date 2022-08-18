export const ValidarUsuario=async(req, res) => {
    
    const { usuario, password } = req.body

    res.status(200).json({usuario, password})
    
}