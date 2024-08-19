function triggerPromise() {
  const promise = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'Sonner' }), 2000));
  toast.promise(promise(), {
    loading: 'Loading...',
    success: (data) => `${data.name} toast has been added`,
    error: 'Error',
  });
}

// Exemplo de toasts automáticos
/*
toast.success('This is a success message!', {
  position: 'top-center'
});

toast.error('This is an error message!', {
  position: 'bottom-left'
});

toast.info('This is an info message!', {
  position: 'top-right',
  action: {
    label: 'Retry',
    onClick: () => console.log('Retry clicked')
  }
});
*/
