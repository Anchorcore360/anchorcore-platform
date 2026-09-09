// AnchorCore loader: preserves the working learner portal and layers live trainer authentication on top.
(function () {
  const core = document.createElement('script');
  core.src = 'app-core.js?v=20260909-1';
  core.onload = function () {
    const trainer = document.createElement('script');
    trainer.src = 'trainer-auth.js?v=20260909-1';
    document.body.appendChild(trainer);
  };
  document.body.appendChild(core);
})();
