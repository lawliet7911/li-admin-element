<script lang="ts" setup>

import { QRCode as qr, QRErrorCorrectLevel } from '~/utils/qrcode';
import JsZip from "jszip"
import { saveAs } from "file-saver"
import * as XLSX from "xlsx"
import { UploadFile, UploadFiles, UploadProps } from 'element-plus';
import { useMyDraggable } from '~/use/draggable'

let qrcode: any = ref(null);
let bgImg: any = ref(null);

// step 1.select xlsx file to get the origin data
// step 2.choose image as the qrcode background image
// step 3.use the step 2 image as background,drag label & qrcode get x,y and other settings
// step 4.download and show progress

// 1 -  4
// TODO extract step1-2 and step-4 functions and complete step3 drag qrcode position and settings
const step = ref<number>(0)

onMounted(() => {
})


let tableData = ref([])
let originData: any[] = []

let pageObj = ref({
  pageSize: 50,
  pageNum: 1,
  total: 0
})

const handleSizeChange = (size: number) => {
  pageObj.value.pageNum = 1
  pageObj.value.pageSize = size
  tableData.value = getTableData(pageObj.value.pageNum, size, originData);
}

const handleCurrentChange = (num: number) => {
  pageObj.value.pageNum = num
  tableData.value = getTableData(pageObj.value.pageNum, pageObj.value.pageSize, originData);
}
const detailVisible = ref<boolean>(false)
const settingVisible = ref<boolean>(false)

const canvasStyle = computed(() => {
  return {
    backgroundImage: `url(${bgImage.value})`,
    backgroundSize: `100% 100%`,
    width: `${originImgInfo.value.width}px`,
    height: `${originImgInfo.value.height}px`,
  }
})


const qrCodeStyle = computed(() => {
  return {
    width: `${settingForm.value.qrWidth}px`,
    height: `${settingForm.value.qrWidth}px`,
    position: `absolute`,
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
  }
})



const showDetail = () => {
  detailVisible.value = true
}

// drag qr
const dragElement = ref<HTMLElement | null>(null)
let { x, y, position } = useMyDraggable(dragElement, {})

const innerVisible = ref(false)
const selectedLabel = ref({})
const canvasLabels = ref<any[]>([])

// add label
const addLabel = () => {
  innerVisible.value = true
  // 1.select a label alias(_column_0,_column_1...) from imported xlsx
  // TODO
  // 2.add label into canvas base
  // 3.create draggable labels and store positions
  // 4.can also set text onto label for preview
}

const handleConfirmAddLabelClick = () => {
  // labels are repeatable
  canvasLabels.value.push({ ...selectedLabel.value })
  innerVisible.value = false
  selectedLabel.value = {}
}

const handleSettingClick = () => {
  settingVisible.value = true
}

let bgImage = ref('')
let map = new Map();

let ctx: any
let canvas: any
let bgImageElement: HTMLImageElement
const CANVAS_WIDTH: number = 2126
const CANVAS_HEIGHT: number = 1063
const QR_TOP: number = 421
const QR_LEFT: number = 191
const QR_WIDTH: number = 387

const drawBgImg = () => {
  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  ctx.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#fff"; // ????????????
  ctx.fill();
  let img = new Image();
  img.setAttribute("crossOrigin", "anonymous");
  img.src = bgImage.value
  img.onload = function () {
    // ??????
    bgImageElement = img;
    ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };
}

let tableTitleKeys = ref<any>([])
let originExcelData: any[] = []
const readExcelCode: UploadProps['onChange'] = (file: UploadFile, files: UploadFiles) => {
  let sheetTitleKeys: string[] = []
  tableTitleKeys.value = []
  let transData: any[] = []
  const fileReader = new FileReader();
  fileReader.onload = event => {
    try {
      const data = (event as any).target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0]; //???????????????
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); //??????json????????????
      sheetData.forEach(item => {
        let o: any = {}
        Object.keys((item as any)).forEach((key, index) => {
          let value = (item as any)[key];
          let alias = `_column_${index}`;
          (item as any).alias = alias
          if (!sheetTitleKeys.includes(key)) {
            sheetTitleKeys.push(key)
            tableTitleKeys.value.push({ label: key, alias })
          }
          o[alias] = value
        })
        transData.push(o)
        // let companyName: string = (item as any)["????????????"];
        // let carNumber: string = (item as any)['????????????']
        // let obj = map.get(companyName) || map.set(companyName, []).get(companyName);
        // let companyCar = obj;
        // companyCar.push(carNumber)
        // carNoList.push({ carNo: carNumber, company: companyName });
      });
      originExcelData = sheetData
      // console.log(tableTitleKeys)
      // splitMap(map) todo
      originData = transData
      tableData.value = getTableData(pageObj.value.pageNum, pageObj.value.pageSize, originData);
      step.value++
    } catch (e) {
      console.warn(e);
      // todo
      // this.msgError("????????????????????????");
      return false;
    }
  };
  if (!file) return
  if (!file.raw) return
  fileReader.readAsBinaryString(file.raw);
}

const getBase64 = (imgUrl: string) => {
  window.URL = window.URL || window.webkitURL;
  var xhr = new XMLHttpRequest();
  xhr.open("get", imgUrl, true);
  // ????????????
  xhr.responseType = "blob";
  xhr.onload = function () {
    if (this.status == 200) {
      //????????????blob??????
      var blob = this.response;
      // ????????????
      let oFileReader = new FileReader();
      oFileReader.onloadend = function (e) {
        if (!e.target) return
        let base64 = e.target.result;
        bgImage.value = base64 as string;
        drawBgImg();

        // console.log("????????????????????????????????????", base64)
      };
      oFileReader.readAsDataURL(blob);
    }
  };
  xhr.send();
}


const originImgInfo = ref({
  width: 0,
  height: 0
})
const chooseImage: UploadProps['onChange'] = (file: UploadFile) => {
  const reader = new FileReader();
  if (!file.raw) return
  reader.readAsDataURL(file.raw);
  reader.onload = e => {
    // this.msgSuccess("??????????????????????????????");
    if (!e.target) return
    bgImg.value.src = e.target.result;
    nextTick(() => {
      let { naturalWidth, naturalHeight } = bgImg.value;
      originImgInfo.value.width = naturalWidth
      originImgInfo.value.height = naturalHeight
    })

    bgImage.value = e.target.result as string;
    drawBgImg()
    step.value++
  };
}

const getTableData = (page = 1, pageSize = 10, totalData: any[] = []) => {
  const { length } = totalData;
  const tableData: any = {
    data: [],
    page,
    pageSize,
    length,
  };
  if (pageSize >= length) {
    tableData.data = totalData;
    tableData.page = 1;
  } else {
    const num = pageSize * (page - 1);
    if (num < length) {
      const startIndex = num;
      const endIndex = num + pageSize - 1;
      tableData.data = totalData.filter((_, index) => index >= startIndex && index <= endIndex);
    } else {
      const size = parseInt(String(length / pageSize));
      const rest = length % pageSize;
      if (rest > 0) {
        tableData.page = size + 1;
        tableData.data = totalData.filter((_, index) => index >= (pageSize * size) && index <= length);
      } else if (rest === 0) {
        tableData.page = size;
        tableData.data = totalData.filter((_, index) => index >= (pageSize * (size - 1)) && index <= length);
      }
    }
  }
  pageObj.value = {
    total: length,
    pageSize: pageSize,
    pageNum: page
  }
  return tableData.data;
}

const FILE_SPLIT_COUNT: number = 300
const splitMap = (map: Map<string, Array<string>>) => {
  let split = FILE_SPLIT_COUNT
  map.forEach((arr, name) => {
    let newArr = []
    for (let i = 0; i < arr.length;) {
      newArr.push(arr.slice(i, i += split));
    }
    if (newArr.length > 1) {
      map.delete(name);
      for (let j = 0; j < newArr.length; j++) {
        let arr = newArr[j];
        map.set(`${name}${(j * split + 1)}-${split > arr.length ? j * split + arr.length : (j + 1) * split
          }`, arr)
      }
    }
  })
}

const downloadBatch = async () => {
  let mapIter = map[Symbol.iterator]();
  let task = mapIter.next();
  let [fileName, queue] = task.value;
  let flag = true;

  while (flag) {
    console.log('Loop start-' + fileName);
    await loopTask(queue, fileName)

    task = mapIter.next()
    flag = !task.done;
    if (!flag) {
      console.log('DONE');
      break
    } else {
      console.log('NEXT MAP');
    }
    [fileName, queue] = task.value;
  }
}
const zip: JsZip = new JsZip();

let imgs: any[] = []
const createQRCode = (url: string, text: string, fileName: string, oneImage: boolean = true, zipName: string) => {
  qrcode.value.innerHTML = "";
  let codeImg = new qr(qrcode.value, {
    width: 420,
    height: 420,
    colorDark: "#000000", //???
    colorLight: "#ffffff", //??????
    correctLevel: QRErrorCorrectLevel.H
  });
  codeImg.clear(); //???????????????
  codeImg.makeCode(url);

  //??????canvas??????
  const qrDom = document.getElementById("qrcode")
  let myCanvas = qrDom && qrDom
    .getElementsByTagName("canvas");
  // let img=document.getElementById('qrcode').getElementsByTagName('img')
  let qrBase64 = myCanvas && myCanvas[0].toDataURL("image/png");
  if (!qrBase64) return
  return drawQRCodeOnBg(qrBase64, text, fileName, oneImage, zipName);
}

const CANVAS_PARAMS: number[] = [0, 0, CANVAS_WIDTH, CANVAS_HEIGHT]
const drawQRCodeOnBg = (qrBase64: string, text: string, fileName: string, oneImage: boolean, zipName: string) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    // ????????????
    img.setAttribute("crossOrigin", "anonymous");
    img.src = qrBase64;
    console.log('drawing');
    img.onload = function () {
      ctx.fillStyle = "#ffffff"; //??????????????????
      // ??????
      ctx.fillRect(...CANVAS_PARAMS); //??????xy wh
      // ??????
      ctx.drawImage(bgImageElement, ...CANVAS_PARAMS); //???????????????

      ctx.drawImage(img, QR_LEFT, QR_TOP, QR_WIDTH, QR_WIDTH); //???????????????

      // ?????????
      ctx.font = "bold 64px Microsoft YaHei bolder";
      ctx.textAlign = "center";
      ctx.fillStyle = "#ec6723";
      ctx.fillText(text, 382, 395); //xy

      // ????????????
      let base64 = canvas.toDataURL("image/jpeg");

      if (oneImage) {
        downImg(base64, fileName);
      } else {
        imgs.push({ url: base64, name: text });
        zip.file(fileName + ".jpeg", base64.substring(22), {
          base64: true
        });
        console.log("ok");
        resolve(true);
      }
    };
  })
}
const downImg = (url: string, name: string) => {
  var a = document.createElement("a");
  var event = new MouseEvent("click");
  a.download = name || "photo";
  a.href = url;
  a.dispatchEvent(event);
}

const qrBaseUrl = 'https://www.baidu.com'
const loopTask = async (queue: any[], zipName: string) => {
  let _p: any = []
  queue.forEach(no => {
    let url = `${qrBaseUrl}?carNo=${no}`;
    _p.push(createQRCode(url, no, no, false, zipName));
  })
  return new Promise((resolve, reject) => {
    Promise.all(_p).then(res => {
      zip.generateAsync({ type: "blob" }).then(async (content) => {
        console.log('start download');
        // ??????????????????
        await saveAs(content, zipName + ".zip"); // ??????file-saver????????????
        imgs = [];
        zip.files = [];
        resolve(true)
        // loadingInstance.close();
      });
    })
  })

}

const downOneQRCodeImage = (item: any) => {
  if (!bgImage) {
    // this.msgInfo("??????????????????????????????????????????");
    return;
  }
  let carNo = item.carNo;
  let url = `${qrBaseUrl}?carNo=${carNo}`;
  createQRCode(url, carNo, carNo, true, '');
}


const settingForm = ref({
  link: '',
  qrWidth: 400
})

const preStep = () => {
  step.value--
}
const nextStep = () => {
  step.value++
}
const startExport = () => {
  downloadBatch()
  // last
  step.value++ // set status finished
}


</script>


<template>
  <div class="export-main">

    <!-- step-bar -->
    <el-steps :active="step" simple finish-status="success">
      <el-step title="????????????????????????" />
      <el-step title="??????????????????" />
      <el-step title="?????????????????????" />
      <el-step title="??????" />
    </el-steps>

    <!-- step -->
    <div class="step" v-if="step === 0">
      <div class="step-title">???????????????????????????????????????Excel??????</div>
      <div class="upload-container">
        <el-upload drag accept=".xlsx" :show-file-list="false" :auto-upload="false" :on-change="readExcelCode">
          <el-icon class="el-icon--upload">
            <ep-upload-filled />
          </el-icon>
          <div class="el-upload__text">
            ???????????????????????????????????????????????? or <em>????????????</em>
          </div>
        </el-upload>
      </div>

    </div>

    <div class="step" v-else-if="step === 1">
      <div class="step-title">???????????????????????????</div>
      <div class="upload-container">
        <el-upload drag accept=".png,.jpeg,.jpg" :show-file-list="false" :auto-upload="false" :on-change="chooseImage">
          <el-icon class="el-icon--upload">
            <ep-upload-filled />
          </el-icon>
          <div class="el-upload__text">
            ????????????????????????????????? or <em>????????????</em>
          </div>
        </el-upload>
      </div>
    </div>

    <div class="step" v-else-if="step === 2">
      <div class="step-title">?????????????????????</div>
      <div class="settings">
        <el-button type="primary" size="small" @click="showDetail()">??????????????????</el-button>
        <el-button type="primary" size="small" @click="handleSettingClick()">?????????????????????</el-button>
      </div>
      <div class="detail">
        <el-descriptions title="?????????????????????">
          <el-descriptions-item label="??????">{{ originImgInfo.width }}</el-descriptions-item>
          <el-descriptions-item label="??????">{{ originImgInfo.height }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="????????????????????????">
          <el-descriptions-item v-for="item in tableTitleKeys" :key="item.alias" :label="item.label + '???'">{{ item.alias
          }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="???????????????">
          <el-descriptions-item label="X???">{{ position.x }}</el-descriptions-item>
          <el-descriptions-item label="Y???">{{ position.y }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="settingForm" label-width="120px">
          <el-form-item label="???????????????">
            <el-input v-model="settingForm.link" />
          </el-form-item>

        </el-form>

      </div>
    </div>

    <div class="step" v-else-if="step === 3">
      STEP4
    </div>

    <div class="step-buttons">
      <el-button type="primary" @click="preStep()" v-if="step !== 0">?????????</el-button>
      <!-- <el-button type="primary" @click="nextStep()" v-if="step !== 3">?????????</el-button> -->
      <el-button type="primary" @click="startExport()" v-if="step === 2">
        <!-- <el-button type="primary" @click="startExport()" v-if="step === 3"> -->
        <el-icon>
          <ep-download />
        </el-icon>
        ??????
      </el-button>
    </div>

    <!-- <div> -->
    <div style="position: absolute;margin-top: -10000px;">
      <img ref="bgImg" :src="bgImage" />
      <div id="qrcode" ref="qrcode"></div>
      <canvas style="width: 945px;height: 575px;" id="canvas" ref="canvas" width="2126" height="1063"></canvas>
      <img style="width: 945px;height: 575px;" />
    </div>

    <el-dialog v-model="detailVisible" width="70%" title="????????????/????????????" destroy-on-close center>

      <el-descriptions title="????????????????????????">
        <el-descriptions-item v-for="item in tableTitleKeys" :key="item.alias" :label="item.label + '???'">{{ item.alias
        }}
        </el-descriptions-item>
      </el-descriptions>
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column type="index" label="??????" align="center" width="55px"> </el-table-column>
        <el-table-column v-for="item in tableTitleKeys" :key="item.alias" :prop="item.alias" :label="item.label">
          <template #default="{ row }">
            {{ row[item.alias] }}
          </template>
        </el-table-column>

        <el-table-column label="??????">
          <template #default="{ row }">
            <el-button type="text" @click="downOneQRCodeImage(row)">???????????????</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="page-main" background layout="total, prev, pager, next, jumper, sizes"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-size="pageObj.pageSize"
        :current-page="pageObj.pageNum" :page-sizes="[100, 200, 300, 400]" :total="pageObj.total">
      </el-pagination>

    </el-dialog>

    <el-dialog v-model="settingVisible" fullscreen title="???????????????" center>
      <el-dialog v-model="innerVisible" width="30%" title="??????Label" append-to-body>
        <div class="setting-item">
          <div class="label">label</div>
          <div class="value">
            <el-select v-model="selectedLabel" value-key="alias" placeholder="??????label">
              <el-option v-for="item in tableTitleKeys" :label="item.label" :value="item" :key="item.alias"></el-option>
            </el-select>
          </div>
        </div>

        <el-button @click="handleConfirmAddLabelClick">
          ??????
        </el-button>
      </el-dialog>
      <div class="canvas-container">
        <div class="_l">
          <div class="canvas-base" :style="canvasStyle">
            <div class="drag" ref="dragElement" :style="qrCodeStyle"></div>
          </div>
        </div>
        <div class="_r">
          <div class="tips">
            <span class="notice">TIP???</span>
            ????????????????????????????????????label??????????????????????????????????????????????????????
          </div>
          <div class="sub-title">???????????????</div>
          <div class="setting-item">
            <div class="label">X</div>
            <div class="value">
              <el-input-number type="number" v-model="position.x" />
            </div>
          </div>

          <div class="setting-item">
            <div class="label">Y</div>
            <div class="value">
              <el-input-number type="number" v-model="position.y" />
            </div>
          </div>

          <div class="sub-title">??????label</div>
          <el-button @click="addLabel">
            <el-icon class="mr5">
              <ep-plus />
            </el-icon>
            ??????
          </el-button>
          <div class="setting-columns">
            <div class="columns" v-for="item in canvasLabels">
              {{item.label}} : {{item.alias}}</div>
          </div>
        </div>
      </div>

    </el-dialog>

  </div>
</template>

<style lang="scss" scoped>
.export-main {
  height: 100%;
  overflow-y: auto;

  .step {
    min-height: 300px;

    >div {
      padding: 20px;
    }

    .step-title {
      font-size: 22px;
      padding: 20px 20px 0;
      text-align: center;
      font-weight: 500;
    }

    .settings {
      padding: 20px;
    }

  }

  .step-buttons {
    display: flex;
    justify-content: center;
  }



}

.canvas-container {
  display: flex;

  ._l {
    flex: 1;
    overflow: auto;

    .canvas-base {
      position: relative;
    }

    .drag {
      background: #ccc;
    }
  }

  --block-tip-bg-color: rgba(var(--el-color-primary-rgb), .1);

  ._r {
    width: 200px;
    box-sizing: border-box;
    padding: 10px;

    .tips {
      padding: 8px 16px;
      background-color: var(--block-tip-bg-color);
      border-radius: 4px;
      border-left: 5px solid var(--el-color-primary);
      margin: 0 0 20px 0;
      font-size: 13px;
      line-height: 1.3;

      .notice {
        font-weight: bold;
        font-size: 16px;
        color: red;
      }
    }

    .sub-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
    }

  }

}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  .label {
    width: 40px;
  }

  .value {
    flex: 1;
  }
}

.table-main {
  padding: 0 15px;
}

.table-top {
  width: 100%;
  height: 30px;
  margin-top: 30px;
  position: relative;
}

.upfileinpbtn {
  width: 100px;
  height: 32px;
  background: #ccc;
  position: absolute;
  z-index: 9;
  left: 150px;
  opacity: 0;
  cursor: pointer;
}

.uploadBtn {
  display: inline-block;
}

.allExpListBtn {
  position: absolute;
  right: 80px;
}

.downBtn {
  position: absolute;
  left: 250px;
}

.uploadBgBtn {
  position: absolute;
  right: 240px;
}

.el-table thead th {
  background: #f5f5f5;
}

.table-body {
  margin-top: 10px;
}

.page-main {
  text-align: center;
  margin: 30px auto;
}

.el-range-editor--small.el-input__inner {
  width: 100%;
}

.el-checkbox-item {
  display: inline-block;
  margin-left: 15px;
}

.table-main {
  flex: 1;
  padding: 0 15px;
}

.btn-link {
  display: inline-block;
  color: #fff;
  background-color: #1890ff;
  border-color: #1890ff;
  padding: 10px 15px 9px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-link:hover {
  background: #46a6ff;
  border-color: #46a6ff;
  color: #fff;
}

/* step */
.upload-container {
  padding: 20px;

}

:deep(.el-step__title) {
  text-overflow: ellipsis;
  word-break: keep-all !important;
  overflow: hidden;
}
</style>
