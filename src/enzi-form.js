angular.module('enzi-form', [])
.factory('enziForm', ['$rootScope', '$compile', function ($rootScope, $compile) {
	var enziForm = {
		showForm: function (title, fields, record, onsave) {
			var dialog;
			var enziForm = {
				fields: fields,
				record: record,
				title: title,
				onkeydown: function (e) {
					if (e.keyCode == 27)
						$rootScope.enziForm.destroyDialog();
				},
				destroyDialog : function () {
					dialog.remove();
					if (oncancel)
						oncancel();
				},
				onSaveDialog : function (record, onsuccess) {
					if (onsave) {
						onsave(record, function () {
							dialog.remove();
						});
					}
				}
			}

			$rootScope.enziForm = enziForm;
			dialog = angular.element('<div class="modal fade in" tabindex="-1" role="dialog" style="display: block;" ng-keydown="enziForm.onkeydown($event)">\
<div class="modal-backdrop fade in" style="height: 100%; width: 100%; position: fixed;" ></div><style>.ng-invalid {border-color: red;} </style>\
<div class="modal-dialog "><div class="modal-content">\
<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close" ng-click="enziForm.destroyDialog($event)"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">{{enziForm.title}}</h4></div>\
<div class="modal-body"><div name="formEnzi" enzi-form="enziForm.fields" record="enziForm.record" onsave="enziForm.onSaveDialog(record, onsuccess)" ></div></div>\
<div class="modal-footer"></div></div></div>');
			dialog = $compile(dialog)($rootScope);
			$('body').append(dialog);
			setTimeout(function () { dialog.find('input')[0].focus();}, 100);
		}
	};
	return enziForm;
}])
.directive('enziField', function () {
	return {
		scope: {
			field: '=enziField',
			record: '=',
			form: '='
		},
		controller: ['$scope', '$element', '$compile', '$filter', function ($scope, $element, $compile, $filter) {
			var formControl;
			switch ($scope.field.type) {
				case 'picklist':
					if ($scope.field.dependsOn) {

						//In case of dependent picklist, current field values should be retrieved based on dependsOn field value
						formControl = angular.element('<label for="{{field.name}}">{{field.label}}</label>\
						<select name="{{field.name}}" id="{{field.name}}" class="form-control" type="{{field.type}}" ng-model="record[field.name]" ng-options="p as p for p in field.picklistValues[record[field.dependsOn]]" ng-required="field.required" >\
						<option value="" disabled selected>{{field.label}}</option></select>');

						//Watch on dependsOnf field, so if that changes current field should reset to blank
						$scope.$watch("record." + $scope.field.dependsOn, function () {
							$scope.record[$scope.field.name] = '';
						})
					}
					else {
						//Regular picklist where values in current picklist does not depend on any other picklist or field
						formControl = angular.element('<label for="{{field.name}}">{{field.label}}</label>\
					<select name="{{field.name}}" id="{{field.name}}" class="form-control" type="{{field.type}}" ng-model="record[field.name]" ng-options="p as p for p in field.picklistValues" ng-required="field.required" >\
					<option value="" disabled selected>{{field.label}}</option></select>');
					}
					break;
				case 'textarea':
					formControl = angular.element('<label for="{{field.name}}">{{field.label}}</label>\
					<textarea name="{{field.name}}" id="{{field.name}}" class="form-control" ng-model="record[field.name]" placeholder="{{field.label}}" ng-required="field.required" />');
					break;
				default:
					switch ($scope.field.type.toLowerCase()) {
						case 'date':
							if ($scope.record[$scope.field.name] && $scope.record[$scope.field.name] instanceof Date)
								$scope.record[$scope.field.name] = $filter('date')($scope.record[$scope.field.name], 'yyyy-MM-dd');
							break;
						case 'datetime-local':
							if ($scope.record[$scope.field.name] && $scope.record[$scope.field.name] instanceof Date)
								$scope.record[$scope.field.name] = $filter('date')($scope.record[$scope.field.name], 'yyyy-MM-ddTHH:mm');
							break;
					}
					formControl = angular.element('<label for="{{field.name}}">{{field.label}}</label>\
					<input name="{{field.name}}" id="{{field.name}}" class="form-control" type="{{field.type}}" ng-model="record[field.name]" placeholder="{{field.label}}" ng-required="field.required" />');
			}
			//Order is very important for form validations to work, first element should be added to DOM and then compiled.
			$element.append(formControl);
			formControl = $compile(formControl)($scope);
		}]
	}
})
.directive('enziForm', function () {
	return {
		template: '<form role="form" name="formEnzi" ng-keydown="onkeydown($event)">\
					<div class="form-group" ng-repeat="f in fields" enzi-field="f" record="record" form="formName"></div>\
					<button type="submit" class="btn btn-primary" ng-click="save($event)" ng-disabled="formEnzi.$invalid">Save</button></form>',
		scope: {
			title: '=',
			fields: '=enziForm',
			record: '=',
			onsave: '&',
			oncancel: '&'
		},
		controller: ['$scope', '$filter', '$rootScope', '$element', '$attrs', function ($scope, $filter, $rootScope, $element, $attrs) {
			$scope.formName = $attrs.name;
			$scope.save = function (event) {
				if ($scope[$scope.formName].$valid && $scope.save) {
					var record = angular.copy($scope.record);
					angular.forEach($scope.fields, function (f) {
						if (record[f.name]) {
							switch (f.type.toLowerCase()) {
								case 'date': record[f.name] = new Date(record[f.name]); break;
								case 'datetime-local':
									var value = new Date(record[f.name]);
									record[f.name] = new Date(value.getTime() + (value.getTimezoneOffset() * 60 * 1000)); break;
							}
						}
					});
					$scope.onsave({
						record: record,
						onsuccess: function () {
						}
					});
				}
			}

			$scope.cancel = function () {
				$element.remove();
				if ($scope.oncancel)
					$scope.oncancel();
			}
		}]
	}
})
