// Гладкий скролл по якорям
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
  })
});

// Липкая панель CTA
const sticky = document.getElementById('stickyBar');
let shown = false;
window.addEventListener('scroll', () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  if(y > 600 && !sticky.classList.contains('show')) sticky.classList.add('show');
  if(y <= 200 && sticky.classList.contains('show') && !shown) sticky.classList.remove('show');
});

// Модальное окно
const modal = document.getElementById('modal');
document.querySelectorAll('[data-open="callback"]').forEach(btn=>{
  btn.addEventListener('click', ()=> modal.classList.add('open'));
});
document.getElementById('modalClose')?.addEventListener('click', ()=> modal.classList.remove('open'));
modal?.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.remove('open'); });

// Exit-intent (покажем модалку один раз)
let exitShown = false;
document.addEventListener('mouseleave', (e)=>{
  if(e.clientY <= 0 && !exitShown){
    exitShown = true;
    modal?.classList.add('open');
  }
});

// Универсальная обработка всех форм
function attachForms(){
  document.querySelectorAll('form[data-form]').forEach(form=>{
    const status = form.querySelector('.status');
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errs = [];

      // honeypot
      if(data.hp && data.hp.trim() !== '') return;

      // простая валидация
      if(!data.name || data.name.trim().length < 2) errs.push('Имя');
      if(!data.phone || data.phone.replace(/\D/g,'').length < 10) errs.push('Телефон');
      if(form.querySelector('input[type="email"][required]') && (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) errs.push('Email');
      if(form.querySelector('#agree') && !form.querySelector('#agree').checked) errs.push('Согласие');

      if(errs.length){
        status.textContent = 'Заполните: ' + errs.join(', ');
        status.className = 'status danger';
        return;
      }

      try{
        const resp = await fetch('https://httpbin.org/post', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({source:'dsm-site', page: location.pathname, ...data})
        });
        if(resp.ok){
          status.textContent = 'Спасибо! Мы свяжемся в течение рабочего дня.';
          status.className = 'status';
          form.reset();
        }else throw new Error('net');
      }catch(err){
        status.textContent = 'Не удалось отправить. Напишите на info@gk-dsm.ru';
        status.className = 'status danger';
      }
    });
  });
}
attachForms();
