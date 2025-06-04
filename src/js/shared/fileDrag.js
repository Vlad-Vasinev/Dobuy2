

(function (document, window, index) {
  // feature detection for drag&drop upload
  var isAdvancedUpload = function () {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
  }();


  // applying the effect for every form
  var forms = document.querySelectorAll('.drag-file');
  Array.prototype.forEach.call(forms, function (form) {
    let input = form.querySelector('input[type="file"]'),
      label = form.querySelector('.drag-file__input label span'),
      errorMsg = form.querySelector('.drag-file__message'),
      dismiss = form.querySelector('.drag-file__dismiss-icon'),
      restart = form.querySelectorAll('.drag-file__restart'),
      droppedFiles = false,
      showFiles = function (files) {
        // label.textContent = files.length > 1 ? (input.getAttribute('data-multiple-caption') || '').replace('{count}', files.length) : files[0].name;
        const filename = files[0].name;
        if(filename.substring(0, filename.lastIndexOf('.')).length > 19){
          label.textContent = filename.substring(0, filename.lastIndexOf('.')).slice(0, 19) + '…' + filename.substring(filename.lastIndexOf('.')+1, filename.length)
        }
        else(
          label.textContent = filename
        )
      },
      triggerFormSubmit = function () {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('submit', true, false);
        form.dispatchEvent(event);
      },
      validateSize = function(input) {
        const fileSize = input.files[0].size / 1024 / 1024; // in MiB
        if (fileSize > 5.1) {
          errorMsg.textContent = 'Размер файла не должен превышать 5Mb'
          input.value = '';
          return false;
        } else {
          return true
        }
      },
      validateExt = function (input) {
        
        const filePath = input.value;
        // Allowing file type
        const allowedExtensions =
          /(\.doc|\.docx|\.odt|\.pdf|\.tex|\.txt|\.rtf|\.wps|\.wks|\.wpd|\.pages|\.jpg|\.jpeg|\.png|\.gif)$/i;
        if (!allowedExtensions.exec(filePath)) {
          // alert('Invalid file type');
          errorMsg.textContent = 'Данный формат файла не поддерживается'
          input.value = '';
          return false;
        }
        else{
          return true;
        }
      }
      ;

    // letting the server side to know we are going to make an Ajax request
    // var ajaxFlag = document.createElement('input');
    // ajaxFlag.setAttribute('type', 'hidden');
    // ajaxFlag.setAttribute('name', 'ajax');
    // ajaxFlag.setAttribute('value', 1);
    // form.appendChild(ajaxFlag);

    // automatically submit the form on file select
    input.addEventListener('change', function (e) {
      
      if(validateExt(e.target) && validateSize(e.target) ){
        showFiles(e.target.files);
        form.classList.add('file-attached')
        errorMsg.textContent = ''
      }
      else{
        label.textContent = 'Прикрепить файл'
        form.classList.remove('file-attached')
      }
      // triggerFormSubmit();
    });
    dismiss.addEventListener('click', function (e) {
      e.preventDefault()
      input.value = ''
      form.classList.remove('file-attached')
      label.textContent = 'Прикрепить файл'
      errorMsg.textContent = ''
    });

    // drag&drop files if the feature is available
    if (isAdvancedUpload) {
      form.classList.add('has-advanced-upload'); // letting the CSS part to know drag&drop is supported by the browser

      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
        form.addEventListener(event, function (e) {
          // preventing the unwanted behaviours
          e.preventDefault();
          e.stopPropagation();
        });
      });
      ['dragover', 'dragenter'].forEach(function (event) {
        form.addEventListener(event, function () {
          form.classList.add('is-dragover');
        });
      });
      ['dragleave', 'dragend', 'drop'].forEach(function (event) {
        form.addEventListener(event, function () {
          form.classList.remove('is-dragover');
        });
      });
      form.addEventListener('drop', function (e) {
          
        droppedFiles = e.dataTransfer.files; // the files that were dropped
        input.files = droppedFiles
        input.dispatchEvent(new Event('change'))
        
        // if(validateExt(e.target) && validateSize(e.target) ){
        //   showFiles(e.target.files);
        // }
        // triggerFormSubmit();

      });
    }


    // if the form was submitted
    // form.addEventListener('submit', function (e) {
    //   // preventing the duplicate submissions if the current one is in progress
    //   if (form.classList.contains('is-uploading')) return false;

    //   form.classList.add('is-uploading');
    //   form.classList.remove('is-error');

    //   if (isAdvancedUpload) // ajax file upload for modern browsers
    //   {
    //     e.preventDefault();

    //     // gathering the form data
    //     var ajaxData = new FormData(form);
    //     if (droppedFiles) {
    //       Array.prototype.forEach.call(droppedFiles, function (file) {
    //         ajaxData.append(input.getAttribute('name'), file);
    //       });
    //     }

    //     // ajax request
    //     var ajax = new XMLHttpRequest();
    //     ajax.open(form.getAttribute('method'), form.getAttribute('action'), true);

    //     ajax.onload = function () {
    //       form.classList.remove('is-uploading');
    //       if (ajax.status >= 200 && ajax.status < 400) {
    //         var data = JSON.parse(ajax.responseText);
    //         form.classList.add(data.success == true ? 'is-success' : 'is-error');
    //         if (!data.success) errorMsg.textContent = data.error;
    //       }
    //       else alert('Error. Please, contact the webmaster!');
    //     };

    //     ajax.onerror = function () {
    //       form.classList.remove('is-uploading');
    //       alert('Error. Please, try again!');
    //     };

    //     ajax.send(ajaxData);
    //   }
    //   else // fallback Ajax solution upload for older browsers
    //   {
    //     var iframeName = 'uploadiframe' + new Date().getTime(),
    //       iframe = document.createElement('iframe');

    //     $iframe = $('<iframe name="' + iframeName + '" style="display: none;"></iframe>');

    //     iframe.setAttribute('name', iframeName);
    //     iframe.style.display = 'none';

    //     document.body.appendChild(iframe);
    //     form.setAttribute('target', iframeName);

    //     iframe.addEventListener('load', function () {
    //       var data = JSON.parse(iframe.contentDocument.body.innerHTML);
    //       form.classList.remove('is-uploading')
    //       form.classList.add(data.success == true ? 'is-success' : 'is-error')
    //       form.removeAttribute('target');
    //       if (!data.success) errorMsg.textContent = data.error;
    //       iframe.parentNode.removeChild(iframe);
    //     });
    //   }
    // });


    // restart the form if has a state of error/success
    Array.prototype.forEach.call(restart, function (entry) {
      entry.addEventListener('click', function (e) {
        e.preventDefault();
        form.classList.remove('is-error', 'is-success');
        input.click();
      });
    });

    // Firefox focus bug fix for file input
    // input.addEventListener('focus', function () { input.classList.add('has-focus'); });
    // input.addEventListener('blur', function () { input.classList.remove('has-focus'); });

  });

})(document, window, 0);
