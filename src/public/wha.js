var DivImage = document.getElementById('images')

window.addEventListener('load', () => {
    fetch('https://api.t-ickets.com/storange/api/get_image')
        .then(res => res.json())
        .then(data => {
            console.log(data.archivos)
            data.archivos.forEach(item => {
                // if(true){
                //     let domino = 'http://localhost:4000'+item.split('https://api.t-ickets.com/storange')[1]
                //     DivImage.innerHTML += `
                //             <img src="${domino}" alt="" width="250px">
                //     `
                // }
                DivImage.innerHTML += `
                <img src="${item}" alt="" width="250px">
                `
            })
        })
})




