const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const treeFoler = $('.tree');

const data = `[
  {
    "name": "Thư mục A",
    "type": "folder",
    "children": [
      {
        "name": "file_a1.txt",
        "type": "file"
      },
      {
        "name": "Thư mục B",
        "type": "folder",
        "children": [
          {
            "name": "file_b1.txt",
            "type": "file"
          },
          {
            "name": "file_b2.txt",
            "type": "file"
          }
        ]
      },
      {
        "name": "file_a2.txt",
        "type": "file"
      }
    ]
  },
  {
    "name": "Thư mục C",
    "type": "folder",
    "children": [
      {
        "name": "file_c1.txt",
        "type": "file"
      }
    ]
  }
]`;

const arrListFiles = JSON.parse(data)
//console.log(arrListFiles);


// escape để tránh lỗi XSS
function escapeHtml(str) {
  let wrapper = document.createElement('div');
  wrapper.innerText = str;
  return wrapper.innerHTML;
}

// Tạo tree
function createTree(data) {
  const ul = document.createElement('ul');
  data.forEach(item => {
    const li = document.createElement('li');
    if (item.type === 'folder') {
      const span = document.createElement('span');
      span.className = 'folder file-name';
      span.setAttribute('data-toggle', 'folder');
      span.textContent = escapeHtml(item.name);
      li.appendChild(span);
      const childrenUl = createTree(item.children || []);
      childrenUl.className = 'children';
      li.appendChild(childrenUl);
    } else {
      const span = document.createElement('span');
      span.className = 'file file-name';
      span.textContent = escapeHtml(item.name);
      li.appendChild(span);
    }

    ul.appendChild(li);
  });
  return ul;
}

function displayTree() {
  const treeContainer = $('.tree');
  const tree = createTree(arrListFiles);
  treeContainer.appendChild(tree);
}

// hiển thị cây thư mục
displayTree();

treeFoler.addEventListener('click', (e) => {
  if (e.target.matches('[data-toggle="folder"]')) {
    const nextUl = e.target.nextElementSibling;
    if (nextUl && nextUl.classList.contains('children')) {
      //nextUl.classList.toggle('open'); // có thể dùng class hidden thay cho open
      if (nextUl.classList.contains('open')) {
        nextUl.style.maxHeight = nextUl.scrollHeight + 'px';
        requestAnimationFrame(() => {
          nextUl.style.maxHeight = '0';
          nextUl.classList.remove('open');
        });

      } else {
        nextUl.classList.add('open');
        nextUl.style.maxHeight = nextUl.scrollHeight + 'px';
      }
      
      nextUl.addEventListener('transitionend', function handler() {
        if (nextUl.classList.contains('open')) {
          nextUl.style.maxHeight = 'none';
        }
        nextUl.removeEventListener('transitionend', handler);
      });
    }
  }
})

// hiện context menu khi click chuột phải
// và xử lý các sự kiện như rename, delete
let currentTarget = null;

document.addEventListener('contextmenu', function (e) {
  const isTarget = e.target.closest('.file, .folder');

  if (isTarget) {
    e.preventDefault();
    currentTarget = isTarget;

    const menu = document.getElementById('context-menu');
    menu.style.top = `${e.pageY}px`;
    menu.style.left = `${e.pageX}px`;
    menu.style.display = 'block';
  } else {
    document.getElementById('context-menu').style.display = 'none';
  }
});

document.addEventListener('click', function () {
  document.getElementById('context-menu').style.display = 'none';
});

// Rename
document.getElementById('rename').addEventListener('click', () => {
  if (!currentTarget) return;
  const oldName = currentTarget.textContent;
  const oldClass = currentTarget.className;
  // Tạo input thay thế
  const input = document.createElement('input');
  input.type = 'text';
  input.value = oldName;
  input.className = 'rename-input';
  currentTarget.replaceWith(input);
  input.focus();
  input.select();

  // Xử lý khi blur hoặc Enter
  const finishRename = () => {
    const newName = input.value.trim() || oldName;
    const newSpan = document.createElement('span');
    newSpan.className = oldClass;
    newSpan.textContent = newName;
    input.replaceWith(newSpan);
  };

  input.addEventListener('blur', finishRename);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur(); // blur hoàn thành
    if (e.key === 'Escape') {
      input.value = oldName;
      input.blur(); //blur để hoàn thành
    }
  });
});


// Delete
document.getElementById('delete').addEventListener('click', function () {
  if (!currentTarget) return;

  if (confirm('Bạn có chắc muốn xóa mục này?')) {
    const li = currentTarget.closest('li');

    li.style.maxHeight = li.scrollHeight + 'px';

    // Bắt đầu hiệu ứng trong frame tiếp theo
    requestAnimationFrame(() => {
      li.classList.add('fade-out');

      li.addEventListener('transitionend', function handler() {
        li.remove(); // Xóa sau khi hiệu ứng kết thúc
        li.removeEventListener('transitionend', handler);
      });
    });
  }
});
