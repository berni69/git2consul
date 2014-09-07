var should = require('should');
var _ = require('underscore');

// We want this above any git2consul module to make sure logging gets configured
require('./git2consul_bootstrap_test.js');

var git_manager = require('../lib/git_manager.js');
var git_utils = require('./utils/git_utils.js');
var consul_utils = require('./utils/consul_utils.js');

var git_commands = require('../lib/utils/git_commands.js');

var my_git_manager;

describe('File operations', function() {

  var default_repo_config = git_utils.createConfig().repos[0];

  beforeEach(function(done) {
    git_manager.createGitManager(default_repo_config, function(err, gm) {
      if (err) return done(err);
      my_git_manager = gm;
      done();
    });
  });

  it ('should handle updates to a single file', function(done) {
    // At this point, my_git_manager should have populated consul with our sample_key.  Now update it.
    var sample_key = 'sample_key';
    var sample_value = 'new test data';
    var default_repo_config = git_utils.createConfig().repos[0];
    git_utils.addFileToGitRepo(sample_key, sample_value, "Update for pull test.", function(err) {
      if (err) return done(err);
      my_git_manager.getBranchManager('master').handleRefChange(0, function(err) {
        if (err) return done(err);
        // At this point, the git_manager should have populated consul with our sample_key
        consul_utils.validateValue('/' + default_repo_config.name + '/master/' + sample_key, sample_value, function(err, value) {
          if (err) return done(err);
          done();
        });
      });
    });
  });

  it ('should handle additions of new files', function(done) {
    // At this point, my_git_manager should have populated consul with our sample_key.  Now update it.
    var sample_key = 'sample_new_key';
    var sample_value = 'new value';
    var default_repo_config = git_utils.createConfig().repos[0];
    git_utils.addFileToGitRepo(sample_key, sample_value, "Update for pull test.", function(err) {
      if (err) return done(err);
      my_git_manager.getBranchManager('master').handleRefChange(0, function(err) {
        if (err) return done(err);
        // At this point, the git_manager should have populated consul with our sample_key
        consul_utils.validateValue('/' + default_repo_config.name + '/master/' + sample_key, sample_value, function(err, value) {
          if (err) return done(err);
          done();
        });
      });
    });
  });

  it ('should handle deletions of existing files', function(done) {
    // At this point, my_git_manager should have populated consul with our sample_key.  Now update it.
    var sample_key = 'sample_new_key';
    var sample_value = 'new value';
    var default_repo_config = git_utils.createConfig().repos[0];
    git_utils.addFileToGitRepo(sample_key, sample_value, "Update for pull test.", function(err) {
      if (err) return done(err);
      my_git_manager.getBranchManager('master').handleRefChange(0, function(err) {
        if (err) return done(err);
        // At this point, the git_manager should have populated consul with our sample_key
        consul_utils.validateValue('/' + default_repo_config.name + '/master/' + sample_key, sample_value, function(err, value) {
          if (err) return done(err);
          git_utils.deleteFileFromGitRepo(sample_key, "Delete file for pull test.", function(err) {
            if (err) return done(err);
            my_git_manager.getBranchManager('master').handleRefChange(0, function(err) {
              if (err) return done(err);
              // At this point, the git_manager should have removed our sample_key
              consul_utils.validateValue('/' + default_repo_config.name + '/master/' + sample_key, undefined, function(err, value) {
                if (err) return done(err);
                done();
              });
            });
          });
        });
      });
    });
  });

  it ('should handle moving an existing file', function(done) {
    // At this point, my_git_manager should have populated consul with our sample_key.  Now update it.
    var sample_key = 'sample_new_key';
    var sample_moved_key = 'sample_moved_key';
    var sample_value = 'movable value';
    var default_repo_config = git_utils.createConfig().repos[0];
    git_utils.addFileToGitRepo(sample_key, sample_value, "Update for pull test.", function(err) {
      if (err) return done(err);
      my_git_manager.getBranchManager('master').handleRefChange(0, function(err) {
        if (err) return done(err);
        // At this point, the git_manager should have populated consul with our sample_key
        consul_utils.validateValue('/' + default_repo_config.name + '/master/' + sample_key, sample_value, function(err, value) {
          if (err) return done(err);
          git_utils.moveFileInGitRepo(sample_key, sample_moved_key, "Move file for pull test.", function(err) {
            if (err) return done(err);
            my_git_manager.getBranchManager('master').handleRefChange(0, function(err) {
              if (err) return done(err);
              // At this point, the git_manager should have populated consul with our moved key, deleting the old name
              consul_utils.validateValue('/' + default_repo_config.name + '/master/' + sample_key, undefined, function(err) {
                if (err) return done(err);
                // At this point, the git_manager should have populated consul with our moved key, adding the new name
                consul_utils.validateValue('/' + default_repo_config.name + '/master/' + sample_moved_key, sample_value, function(err) {
                  if (err) return done(err);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
});
