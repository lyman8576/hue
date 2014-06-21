// Licensed to Cloudera, Inc. under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  Cloudera, Inc. licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function parseAcl(acl) {
  m = acl.match(/(.*?):(.*?):(.)(.)(.)/);
  return {
    'type': m[1],
    'name': m[2],
     'r': m[3],
     'w': m[4],
     'x': m[5],
  }
}

function printAcl(acl) {
  return acl['type'] + ':' + acl['name'] + ':' + acl['r'] + acl['w'] + acl['x'];
}

var Assist = function (vm, assist) {
  var self = this;

  self.path = ko.observable('');
  self.path.subscribe(function () {
	self.fetchPath()
  });
  self.files = ko.observableArray();

  self.acls = ko.observableArray();
  self.owner = ko.observable('');
  self.group = ko.observable('');
  
  self.changed = ko.observable(true); // mocking to true
  
  self.addAcl = function() {
	// should have a good template, also understable for non user, user/group icons button
	self.acls.push(parseAcl('::---'));
  };
    
  self.fetchPath = function () {
    $.getJSON('/filebrowser/view' + self.path() + "?pagesize=15&format=json", function (data) { // Will create a cleaner API by calling directly directly webhdfs#LISTDIR?
      self.files.removeAll();
      $.each(data.files, function(index, item) {
    	self.files.push(item.path); 
      });
      self.getAcls();
    }).fail(function (xhr, textStatus, errorThrown) {
      $(document).trigger("error", xhr.responseText);
    });
  };  
  
  self.getAcls = function () {
    $.getJSON('/security/api/get_acls', {
    	'path': self.path()
      }, function (data) {
        self.acls.removeAll();
        $.each(data.entries, function(index, item) {
    	  self.acls.push(item); 
        });
        self.acls.push(parseAcl("user:joe:r-x")); // mocking
        self.acls.push(parseAcl("group::r--")); // mocking
        self.acls.push(parseAcl("group:execs:rw-")); // mocking
        self.owner(data.owner);
        self.group(data.group);
    }).fail(function (xhr, textStatus, errorThrown) {
      $(document).trigger("error", xhr.responseText);
    });
  };
  
  self.save = function () {
	// update acls, add new ones, remove ones?
  }
}

// not sure if we should merge Assist here yet

var HdfsViewModel = function (context_json) {
  var self = this;

  // Models
  self.assist = new Assist(self, context_json.assist);

  self.assist.path('/tmp');


  function logGA(page) {
    if (typeof trackOnGA == 'function') {
      trackOnGA('security/hdfs' + page);
    }
  }
};
