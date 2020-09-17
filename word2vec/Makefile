.PHONY: setup

setup:
	pipenv install
	cd word2vec & curl https://s3-ap-northeast-1.amazonaws.com/dev.tech-sketch.jp/chakki/public/ja.text8.zip -o corpus.zip
	unzip corpus.zip
	mv ja.text8 corpus
	pipenv run python3 train.py
	pipenv run python3 pca.py
	cp word2vec.json ../assets/json
