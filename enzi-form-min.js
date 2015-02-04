angular.module("enzi-form",[]).factory("enziForm",["$rootScope","$compile",function(a,d){return{showForm:function(e,b,f,g){var c;a.enziForm={fields:b,record:f,title:e,onkeydown:function(c){27==c.keyCode&&a.enziForm.destroyDialog()},destroyDialog:function(){c.remove();oncancel&&oncancel()},onSaveDialog:function(a,b){g&&g(a,function(){c.remove()})}};c=angular.element('<div class="modal fade in" tabindex="-1" role="dialog" style="display: block;" ng-keydown="enziForm.onkeydown($event)">\r\n<div class="modal-backdrop fade in" style="height: 100%; width: 100%; position: fixed;" ></div><style>.ng-invalid {border-color: red;} </style>\r\n<div class="modal-dialog "><div class="modal-content">\r\n<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close" ng-click="enziForm.destroyDialog($event)"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">{{enziForm.title}}</h4></div>\r\n<div class="modal-body"><div name="formEnzi" enzi-form="enziForm.fields" record="enziForm.record" onsave="enziForm.onSaveDialog(record, onsuccess)" ></div></div>\r\n<div class="modal-footer"></div></div></div>');
c=d(c)(a);$("body").append(c);setTimeout(function(){c.find("input")[0].focus()},100)}}}]).directive("enziField",function(){return{scope:{field:"=enziField",record:"=",form:"="},controller:["$scope","$element","$compile","$filter",function(a,d,e,b){switch(a.field.type){case "picklist":a.field.dependsOn?(b=angular.element('<label for="{{field.name}}">{{field.label}}</label>\r\n\t\t\t\t\t\t<select name="{{field.name}}" id="{{field.name}}" class="form-control" type="{{field.type}}" ng-model="record[field.name]" ng-options="p as p for p in field.picklistValues[record[field.dependsOn]]" ng-required="field.required" >\r\n\t\t\t\t\t\t<option value="" disabled selected>{{field.label}}</option></select>'),
a.$watch("record."+a.field.dependsOn,function(){a.record[a.field.name]=""})):b=angular.element('<label for="{{field.name}}">{{field.label}}</label>\r\n\t\t\t\t\t<select name="{{field.name}}" id="{{field.name}}" class="form-control" type="{{field.type}}" ng-model="record[field.name]" ng-options="p as p for p in field.picklistValues" ng-required="field.required" >\r\n\t\t\t\t\t<option value="" disabled selected>{{field.label}}</option></select>');break;case "textarea":b=angular.element('<label for="{{field.name}}">{{field.label}}</label>\r\n\t\t\t\t\t<textarea name="{{field.name}}" id="{{field.name}}" class="form-control" ng-model="record[field.name]" placeholder="{{field.label}}" ng-required="field.required" />');
break;default:switch(a.field.type.toLowerCase()){case "date":a.record[a.field.name]&&a.record[a.field.name]instanceof Date&&(a.record[a.field.name]=b("date")(a.record[a.field.name],"yyyy-MM-dd"));break;case "datetime-local":a.record[a.field.name]&&a.record[a.field.name]instanceof Date&&(a.record[a.field.name]=b("date")(a.record[a.field.name],"yyyy-MM-ddTHH:mm"))}b=angular.element('<label for="{{field.name}}">{{field.label}}</label>\r\n\t\t\t\t\t<input name="{{field.name}}" id="{{field.name}}" class="form-control" type="{{field.type}}" ng-model="record[field.name]" placeholder="{{field.label}}" ng-required="field.required" />')}d.append(b);
b=e(b)(a)}]}}).directive("enziForm",function(){return{template:'<form role="form" name="formEnzi" ng-keydown="onkeydown($event)">\r\n\t\t\t\t\t<div class="form-group" ng-repeat="f in fields" enzi-field="f" record="record" form="formName"></div>\r\n\t\t\t\t\t<button type="submit" class="btn btn-primary" ng-click="save($event)" ng-disabled="formEnzi.$invalid">Save</button></form>',scope:{title:"=",fields:"=enziForm",record:"=",onsave:"&",oncancel:"&"},controller:["$scope","$filter","$rootScope","$element",
"$attrs",function(a,d,e,b,f){a.formName=f.name;a.save=function(b){if(a[a.formName].$valid&&a.save){var c=angular.copy(a.record);angular.forEach(a.fields,function(a){if(c[a.name])switch(a.type.toLowerCase()){case "date":c[a.name]=new Date(c[a.name]);break;case "datetime-local":var b=new Date(c[a.name]);c[a.name]=new Date(b.getTime()+6E4*b.getTimezoneOffset())}});a.onsave({record:c,onsuccess:function(){}})}};a.cancel=function(){b.remove();if(a.oncancel)a.oncancel()}}]}});