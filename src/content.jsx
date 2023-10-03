
const hoverUp = document.createElement('div')
hoverUp.id = 'hoverup-id'
hoverUp.style.zIndex = 50
hoverUp.style.display = 'none'

const hoverUpPara = document.createElement('p')
hoverUp.appendChild(hoverUpPara)

document.body.appendChild(hoverUp)

document.addEventListener("mouseover", function (event) {
  if (event.target.nodeName === "A" ) {
    // Extract the hovered word
    const word = event.target.textContent;   
    hoverUpPara.textContent = word

    // Position the popup above the hovered word
    const rect = event.target.getBoundingClientRect();
    hoverUp.style.top = rect.top - 30 + "px"; // Adjust the positioning as needed
    hoverUp.style.left = rect.left + "px";

    setTimeout(() => {
      hoverUp.style.display = 'block'
  }, 1000);
      

    // Append the popup to the body
    document.body.appendChild(hoverUp);
    // this below operation is too much costly
    event.target.addEventListener('mouseout', (event) => {
      hoverUp.style.display = 'none'
    })
  }
});

