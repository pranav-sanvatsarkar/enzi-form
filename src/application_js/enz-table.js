var enzTable = angular.module('enzTable', []);
function unSelect(element)
{
	if ($(element).parent('tr').hasClass('selected'))
		$(element).parent('tr').toggleClass('selected')
	else
	{
		$('tr').removeClass('selected');
		$(element).parent('tr').addClass('selected')
	}
	
}
enzTable.directive('enzTablerow', function () {
	return {
		restrict: 'AE',
		/*scope :{
			record: '=enzTablerow',
			row: '=enzTablerow',
			columns: '='
		},*/
		template: '',
		controller: ['$scope', '$element', '$compile', function ($scope, $element, $compile) {
			var strTemplate = '';

			angular.forEach($scope.columns, function (column, index) {
				if(column.template)
					strTemplate += '<td class="' + ((column.showAlways) ? 'showonmobile' : '') + '" onclick="unSelect(this);" id=' + column.label + ' data-th=' + column.label + '  >' + column.template + '</td>';
				else
					strTemplate += '<td class="' + ((column.showAlways) ? 'showonmobile' : '') + '" onclick="unSelect(this);" id=' + column.label + ' data-th=' + column.label + '  >' + (($scope.record[column.name])? $scope.record[column.name]: '') + '</td>';
			});
			$element.append(strTemplate);
			$compile($element.contents())($scope);


			$scope.call = function (fn) {
				fn();
			}
		}],
	}
});

enzTable.directive('enzTable', function () {
	return {
		restrict: 'AE',
		scope: {
			columns: '=columns',
			getdata: '&getdata',
			sortorder: '=sortorder',
			object: '=object'
		},
		template: '\
				<a href="#" ng-click= "addColum()">test</a>\
				<div style="text-align: right;margin-bottom: 10px;">\
					<input type="search" ng-change="searchTextKeyup(currentPage)" ng-model="keyword" style="float:left" placeholder="Search">\
					<div class="pager">\
						<nav class="pagination">\
							<a class="first" ng-click="checkPaginationEndPoint(1)"><<</a>\
							<a class="prev" ng-click="addPage(-1)"><</a>\
							<div class="pagedisplay">{{currentPage}}/{{pageCount}}</div>\
							<a ng-click="addPage(1)">></a>\
							<a ng-click="checkPaginationEndPoint(pageCount)">>></a>\
							<select class="pagesize ng-pristine ng-untouched ng-valid" ng-model="pageSize" ng-change="callGetDataFunction(1)">\
								<option selected="selected" value="5">5</option>\
								<option value="10">10</option>\
								<option value="20">20</option>\
								<option value="30">30</option>\
								<option value="40">40</option>\
							</select>\
						</nav>\
					</div>\
				</div>\
<div>\
	<div>\
		<table class="table list attachments responsive">\
			<thead>\
				<tr class="headerRow">\
					<th name="{{column.name}}" disableSort={{column.disableSort}} ng-repeat="column in columns" ng-click="sort($event)">{{column.label}}<i style="font-size: 10px;" class="glyphicon"></i></th>\
				</tr>\
			</thead>\
			<tbody>\
				<tr ng-repeat="record in pagedRecords" enz-tablerow="record" columns="modifyColumns">\
				</tr>\
			</tbody>\
		</table>\
	</div>\
</div>',
		controller: function ($scope, $attrs, $filter, $timeout, $compile, $element) {
			$scope.records = [];
			$scope.currentPage = 0;
			$scope.sortOrderCopy = angular.copy($scope.sortorder);
			$scope.pageCount = 1;
			$scope.pageSize = 5;
			$scope.pagedRecords = [];
			$scope.sortAsc = true;
			$scope.totalRecordsCount = -1;
			$scope.searchRecords = [];
			$scope.isDataComeFromServer = false;
			$scope.barrier = 1000;
			$scope.totalRecordsCount = $scope.barrier + 1;
			$scope.searchTotalRecordsCount = $scope.barrier + 1;
			$scope.keyword = "";
			$scope.addPage = function (iCount) {
				$scope.checkPaginationEndPoint($scope.currentPage + iCount);
			}
			$scope.modifyColumnsName = function ()
			{
				$scope.modifyColumns = [];
				if ($scope.columns)
				{
					$scope.modifyColumns = angular.copy($scope.columns);
					angular.forEach($scope.modifyColumns, function (column) {
						column.name = column.name.replace(".", "_");
					})
				}
			}
			$scope.modifyColumnsName();




			$scope.setPage = function (iPage, iTotalCount) {
				var filteredRecords = $filter('filter')($scope.recordsToProcess, $scope.keyword)//$scope.filterRecord($scope.recordsToProcess, $scope.keyword, $scope.modifyColumns);//$filter('filterRelationalData')($scope.records, $scope.keyword, $scope.columns);
				if (filteredRecords && filteredRecords.length >= 0)
					$scope.pageCount = Math.ceil(((iTotalCount) ? (iTotalCount == $scope.recordsToProcess.length)? filteredRecords.length : iTotalCount : filteredRecords.length) / $scope.pageSize);//Math.ceil((($scope.records.length >= ((iTotalCount) ? iTotalCount : $scope.totalRecordsCount)) ? filteredRecords.length : ((iTotalCount) ? iTotalCount : $scope.totalRecordsCount)) / $scope.pageSize);
				else
					$scope.pageCount = 0;

				if ($scope.pageCount == 0)
				{ $scope.currentPage = 1; $scope.pagedRecords = []; return; }
				if (iPage > $scope.pageCount)
					iPage = $scope.pageCount;
				else if (iPage <= 0)
					iPage = 1;
				if ($scope.pageCount == 0)
					$scope.pageCount = 1;
				if (iPage > 0 && iPage <= $scope.pageCount) {
					$scope.currentPage = iPage;
					$scope.pagedRecords = ($scope.isDataComeFromServer) ? filteredRecords : $filter('orderBy')(filteredRecords, $scope.sortBy, !$scope.sortAsc).splice((iPage - 1) * $scope.pageSize, $scope.pageSize);
				}
			}
			$scope.sort = function (e) {
				var field = $(e.currentTarget).attr('name');
				var disableSort = $(e.currentTarget).attr('disableSort');
				if (disableSort != 'true') {
					if ($scope.sortBy == field)
						$scope.sortAsc = !$scope.sortAsc;
					else {
						$element.find('i').removeClass('glyphicon-arrow-up glyphicon-arrow-down')
						$scope.sortAsc = true;
						$scope.sortBy = field;
					}
					$(e.currentTarget).find('i').removeClass('glyphicon-arrow-up glyphicon-arrow-down').addClass(($scope.sortAsc) ? 'glyphicon-arrow-up' : 'glyphicon-arrow-down');
					$scope.sortOrderCopy = [];
					$scope.sortOrderCopy = [{ name: field, direction: ($scope.sortAsc) ? 'asc' : 'desc' }];
					var isTolatRecord = ($scope.keyword) ? $scope.searchTotalRecordsCount <= $scope.searchRecords.lenght : $scope.totalRecordsCount <= $scope.records.lenght;
					if (!isTolatRecord)
						$scope.callGetDataFunction($scope.currentPage);
					else
						$scope.setPage($scope.currentPage);
				}
			}

			$scope.callGetDataFunction = function (page) {
				$scope.isDataComeFromServer = false;
				if ($scope.records.length < $scope.totalRecordsCount) {
					if (($scope.keyword.indexOf($scope.previousKeyword) != -1 && $scope.searchRecords.length == $scope.searchTotalRecordsCount)) {
						$scope.recordsToProcess = angular.copy($scope.searchRecords);
						$scope.setPage(page);
					}
					else {
						$scope.searchRecords = [];
						var isTolatRecord = ($scope.keyword) ? $scope.searchTotalRecordsCount <= $scope.barrier : $scope.totalRecordsCount <= $scope.barrier;
						$scope.getdata({
							callback: function (data) {
								$scope.records = data.Data;
								if ($scope.records)
								{
									$scope.records = $scope.getObjectValue($scope.records);
								}
								$scope.recordsToProcess = angular.copy($scope.records);

								if ($scope.keyword) {
									$scope.searchTotalRecordsCount = data.TotalCount;
									$scope.searchRecords = angular.copy($scope.records);
								}
								else
									$scope.totalRecordsCount = data.TotalCount;
								$scope.isDataComeFromServer = true;
								if ($scope.records.length >= $scope.totalRecordsCount || $scope.records.length >= $scope.searchTotalRecordsCount)
									$scope.isDataComeFromServer = false;
								$scope.setPage(page, ($scope.keyword) ? $scope.searchTotalRecordsCount : $scope.totalRecordsCount);
								$scope.$apply();

							}, object: $scope.object.objectName,
							queryFields: $scope.object.queryfields,
							criteria: $scope.object.criteria,
							sortOrder: $scope.sortOrderCopy,
							keyword: (isTolatRecord && !$scope.keyword) ? "" : $scope.keyword,
							offset: (isTolatRecord) ? -1 : page,
							size: (isTolatRecord) ? -1 : $scope.pageSize
						});
					}
				}
				else {
					$scope.recordsToProcess = angular.copy($scope.records);
					$scope.setPage(page);
				}
			}

			$scope.searchTextKeyup = function (page) {
				if ($scope.timer)
					$timeout.cancel($scope.timer);
				$scope.timer = $timeout(function () {
					if ($scope.keyword.indexOf($scope.previousKeyword) >= 0) {
						if ($scope.searchTotalRecordsCount != $scope.searchRecords.length)
							$scope.callGetDataFunction(page);
						else {
							$scope.recordsToProcess = angular.copy($scope.searchRecords);
							$scope.isDataComeFromServer = false
							$scope.setPage(page);
						}
						$scope.previousKeyword = $scope.keyword;
					}
					else {
						$scope.callGetDataFunction(page);
						$scope.previousKeyword = $scope.keyword;
					}
				}, 800);
			}

			$scope.checkPaginationEndPoint = function (page) {
				if (page <= 0) {
					$scope.currentPage = 1;
					return;
				}
				if (page >= $scope.pageCount + 1) {
					$scope.currentPage = $scope.pageCount;
					return;
				}

				if ($scope.currentPage == page) {
					$scope.currentPage = page;
					return;
				}
				$scope.callGetDataFunction(page);
			}

			$scope.callGetDataFunction(1);

			$scope.getObjectValue = function (records) {
				if (records && records.length > 0)
				{
					angular.forEach(records, function (record) {
						angular.forEach($scope.columns, function (column) {
							if (column.name)
							{
								var arrSplitField = column.name.split(".");
								if (arrSplitField.length > 1)
								{
									var recordCopy = angular.copy(record);
									angular.forEach(arrSplitField, function (field) {
										if (recordCopy)
											recordCopy = recordCopy[field];
									});
									record[arrSplitField.join('_')] = recordCopy;
								}
							}
						})
					})
				}
				return records;
			}

			$scope.filterRecord = function (recordsToBeFilter, strKeyword, columns) {
				var recordRet = [];
				if (strKeyword) {
					angular.forEach(recordsToBeFilter, function (record) {
						var flag = false;
						for (var iIndex = 0; iIndex < columns.length; iIndex++) {
							var datafield = columns[iIndex]
							$scope.filteredData = record[datafield.name];
							if ($scope.filteredData) {
								if ($.type($scope.filteredData) != "string")
									$scope.filteredData = $scope.filteredData + "";
								if (angular.lowercase($scope.filteredData).indexOf(angular.lowercase(strKeyword) || '') != -1) {
									recordRet.push(record);
									break;
								}
							}
						}
					});
				}
				else
					return recordsToBeFilter;
				return recordRet;
			};
		}
	};
})