import JustValidate from 'just-validate';


function grecaptchaCheck() {
  return !!(document.querySelector('script[src*="www.google.com/recaptcha"]'))
}

export function appointFormInit(selector) {
  // Инициализирует форму и капчу в ней 
  
  let forms = []

  if (typeof selector === 'string') {
    forms = document.querySelectorAll(selector)
    if (!forms.length){      
      return
    }
  }
  else {
    forms.push(selector)
  }

  forms.forEach((form) => {
    
    if (form.classList.contains('validation-attached')) {
        
      return
    }
    const rules = [
      {
        ruleSelector: 'input[type="tel"]',
        rules: [
          {
            rule: 'required',
            errorMessage: 'Вы не ввели телефон'
          },
        ],
        tel: true,
        telError: 'Телефон указан неверно'
      },
      {
        ruleSelector: 'input[name="name"]',
        rules: [
          {
            rule: 'required',
            errorMessage: 'Вы не ввели Имя'
          },
        ],
      },
    ]

    if (grecaptchaCheck()) {

      let counter = 5
      function captchaInit(form, cId) {
        if (window.grecaptcha?.render) {
          const rId = window.grecaptcha?.render(cId)
          form.dataset.rId = rId
            
        }
        else if (counter-- != 0) {
          setTimeout(captchaInit, 300, form, cId)

        }
      }
      const captchaId = form.querySelector('.g-recaptcha')?.getAttribute('id');
      if (captchaId) {
        captchaInit(form, captchaId)
      }
    }

    validateForms(form, rules)
    form.classList.add('validation-attached')
  })

}


export default function validateForms(formEl, rules) {
  // Подключает валидацию и обрабатывает ответ запроса
  const form = formEl;

  if (!form) {
    console.error('Нет такого селектора!');
    return false;
  }
  if (!rules) {
    console.error('Вы не передали правила валидации!');
    return false;
  }

  const telSelector = form?.querySelector('input[type="tel"]');
  const mailSelector = form?.querySelector('input[type="email"]');





  if (telSelector) {
    const inputMask = new Inputmask({
      mask: '+7 (999) 999-99-99',
      showMaskOnHover: false,
    });
    inputMask.mask(telSelector);
    for (let item of rules) {
      if (item.tel) {
        item.rules.push({
          rule: 'function',
          validator: function () {
            const phone = telSelector.inputmask.unmaskedvalue();
            return phone.length === 10;
          },
          errorMessage: item.telError
        });
      }
    }
  }
  const validation = new JustValidate(form,
    {
      errorLabelCssClass: 'ui-input__error',
      errorLabelStyle: {},
      // errorsContainer: document.querySelector('.error-field'),
      errorFieldCssClass: 'has-error',
      successFieldCssClass: 'is-valid'
    }
  );

  validation.setCurrentLocale('ru')

  for (let item of rules) {
    validation
      .addField(item.ruleSelector, item.rules);
  }
  function clearForm() {
    form.reset();

    form.querySelectorAll(".ui-input.is-focused").forEach((el) => {
      el.classList.remove('is-focused')
    });

  }
  // validation.onFail(function (fields) {
  //   console.log(fields);
  // })
  // для тестов
  // validation.onSuccess(async (e) => {
  //   form.classList.add('loading')

  //   setTimeout((params) => {
  //     // form.classList.add('hidden');
  //     form.classList.add('hidden');
  //     form.classList.remove('loading');
  //     formRequest.forEach(el => {el.classList.remove('visible'); el.classList.add('hidden')})
  //     formResponse.forEach(el => {el.classList.remove('hidden'); el.classList.add('visible')})
  //     form.dataset.redirect ? window.location.replace(form.dataset.redirect) : undefined
  //     clearForm()
  //   }, 1000);
  // })
  function showError(form, msg) {
    // Заменяет текст в блоке, скрывает форму и показывает ответ
    const errorCtr = form.querySelector('.error-message-ctr')
    if (errorCtr) {
      errorCtr.innerText = msg
    }
    else{
      const message = document.createElement('h6')
      message.innerText = msg
      form.appendChild(message)
    }
  }
  function showResponse(form, msg) {
    // Заменяет текст в блоке, скрывает форму и показывает ответ
    const modal = form.closest('.modal')
    if (!modal) {
      return
    }
    const formRequest = modal.querySelectorAll('.form-request');
    const formResponse = modal.querySelectorAll('.form-response');
    const formResponseMsg = modal.querySelector('.modal__body .form-response');
    if (formResponseMsg) formResponseMsg.textContent = message

    formRequest.forEach(el => { el.classList.remove('visible'); el.classList.add('hidden') })
    formResponse.forEach(el => { el.classList.remove('hidden'); el.classList.add('visible') })

  }
  validation.onSuccess(async (submitEvent) => {
    let captchaExist = grecaptchaCheck() || !!(window.grecaptcha)


    const captchaId = form.dataset.rId;
    if (captchaId) {
      grecaptcha.execute(captchaId)
    }
    else if (captchaExist) {
      console.error('there is no captcha in form')
    }
    const interval = setInterval(function () {
      if ((captchaExist && grecaptcha.getResponse(captchaId)) || !captchaExist) {
        clearInterval(interval)
        const data = new FormData(submitEvent.target)

        form.classList.add('loading')
        const fetchUrl = form.getAttribute('action') ? form.getAttribute('action') : '/api'
        fetch(fetchUrl, {
          method: 'POST',
          body: data
        }).then(response => {
          if (!response.ok) {
            response.json()
              .catch(() => {
                form.classList.add('hidden')
                form.classList.remove('loading')
                showError(form, 'Не удалось отправить форму')
                throw new Error(response.status);
              })
              .then(({ message }) => {
                showError(form, message)
                throw new Error(message || response.status);
              });
          }
          else {
            // form.classList.add('hidden');
            // if(formResponseMsg) formResponseMsg.textContent = response.json();
            // form.classList.remove('loading');
            // showResponse()
            form.dataset.redirect ? window.location.replace(form.dataset.redirect) : undefined
            clearForm()
          }

        });

      }
    }, 1000)
  })

};

