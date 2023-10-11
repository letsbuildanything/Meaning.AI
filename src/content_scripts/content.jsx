import React, {useEffect, useState} from 'react'
import ReactDOM from 'react-dom/client'
import './content.css'

const contentUIRoot = document.createElement('div')
contentUIRoot.className = 'content-ui'
contentUIRoot.style.display = 'none'

const ContentUI = () => {
  const [displayResultArr, setDisplayResultArr] = useState([]);

  useEffect(() => {

    document.addEventListener('click', () => {
      if(contentUIRoot.style.display !== 'none'){
        contentUIRoot.style.display = 'none'
        setDisplayResultArr([])
      }
    })


    chrome.runtime.onConnect.addListener((port) => {
      console.log('connection established!')
      console.assert(port.name === "meaning_ai_42")

      if(port.name === "meaning_ai_42"){
        console.log("connection port established!")

        // making alive the contentUIRoot(root DOM of ContentUI)
        contentUIRoot.style.display = 'block'

        port.onMessage.addListener((msg) => {
          console.log('message arrived!')
          setDisplayResultArr(msg.result.split('\n').filter(item => (!item.includes('\n'))))
        })
      }
    })
  }, [])


  return(
    <div>
      <ul className='contentUI'>
        {displayResultArr.length>0 && displayResultArr.map((textLine) => (<li className='contentUI'>{textLine}</li>))}
      </ul>
    </div>
  )
}


document.body.insertBefore(contentUIRoot, document.body.firstChild)
console.log(ReactDOM.createRoot(contentUIRoot).render(<ContentUI />))
