export function Copy() {
  const copyIconSVG = `
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision">
      <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"></path>
    </svg>
  `;

  const checkIconSVG = `
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" shape-rendering="geometricPrecision">
      <path d="M20 6L9 17l-5-5"></path>
    </svg>
  `;

  let isAnimating = false;

  function onCopy() {
    if (isAnimating) return;

    const codeToCopy = 'npm install sonner-js';
    const copyIcon = document.getElementById('copy-icon');

    navigator.clipboard.writeText(codeToCopy).then(() => {
      isAnimating = true;

      copyIcon.classList.add('fade-out');

      setTimeout(() => {
        copyIcon.innerHTML = checkIconSVG;
        copyIcon.classList.remove('fade-out');
        copyIcon.classList.add('fade-in');

        setTimeout(() => {
          copyIcon.classList.remove('fade-in');
          copyIcon.classList.add('fade-out');

          setTimeout(() => {
            copyIcon.innerHTML = copyIconSVG;
            copyIcon.classList.remove('fade-out');
            copyIcon.classList.add('fade-in');

            setTimeout(() => {
              isAnimating = false;
            }, 100);
          }, 100);
        }, 2000);
      }, 100);
    }).catch(err => {
      console.error('Erro ao copiar o texto: ', err);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const copyIcon = document.getElementById('copy-icon');
    if (copyIcon) {
      copyIcon.innerHTML = copyIconSVG;
      // Attach the onCopy function to the click event of the icon
      copyIcon.addEventListener('click', onCopy);
    }
  });
}
