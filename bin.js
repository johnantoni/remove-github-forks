#!/usr/bin/env node

'use strict';

var program = require('commander');
var confirm = require('confirm-simple');

var clean = require('./index');
var meta = require('./package.json');

program
	.version(meta.version)
	.usage('token')
	.parse(process.argv);

program.on('--help', function(){
  console.log('  Please get the OAuth token:');
  console.log('');
  console.log('  Head to https://github.com/settings/tokens/new');
  console.log('  Create a token with permissions public_repo, delete_repo');
  console.log('  Pass that in the CLI, enjoy!');
});

if (program.args.length !== 1) program.help();

var token = program.args[0];

var abort = function(err){
	console.error(err.message || err);
	process.exit(1);
};

clean.get(token, function(err, repos){
	if (err) return abort(err);
	if (!repos.length) {
		console.log('No useless repositories found.');
		process.exit(0);
	}
	confirm(
		'Delete these forks: \n' + repos.map(function(repo){
			return '    ' + repo.url;
		}).join('\n') + '\n',
		function(confirmed) {
			if (!confirmed) {
				return abort('Aborting.');
			}
			clean.remove(token, repos, function(err){
				if (err) return abort(err);
				console.log('Done!');
				process.exit(0);
			});
		}
	);
});

