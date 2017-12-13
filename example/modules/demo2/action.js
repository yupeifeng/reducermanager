import fetch from 'fetch/fetch';
import ModalTip from 'modalTip';
import { Store, action, actionProps, actionLogs } from 'reducermanager';
const demo2Type = Store.getActionType('demo2Store');

let getColumnList = userCode => {
	let params = {};
	params.userCode = userCode;

	return fetch
		.get('/newsCenrer/queryColumnList4Site', params)
		.then(res => {
			return res.dataList;
		})
		.catch(e => {
			ModalTip.warningTip(e.message);
		});
};

let getNewsList = (userCode, columnId) => {
	let params = {};
	params.pageSize = 20;
	params.pageNum = 0;
	params.userCode = userCode;
	params.columnId = columnId;

	return fetch
		.get('/newsCenrer/queryNewsList4Site', params)
		.then(res => {
			return res.dataList;
		})
		.catch(e => {
			ModalTip.warningTip(e.message);
		});
};

@action('demo2Action')
class demo2Action {
	@actionProps('changeDUserCode')
	static changeDUserCode = dUserCode => async dispatch => {
		dispatch({ type: demo2Type.change_dUserCode, dUserCode: dUserCode });
	};

	@actionProps('changeColumn')
	static changeColumn = userCode => async dispatch => {
		let columnList = await getColumnList(userCode);
		dispatch({
			type: demo2Type.change_columnName,
			columnName: columnList[0].columnName
		});

		let newsList = await getNewsList(userCode, columnList[0].flowId);
		dispatch({
			type: demo2Type.change_newsTitle,
			newsTitle: newsList[0].newsTitle
		});
	};

	@actionProps('changeState')
	@actionLogs('log')
	static changeState = (type, name, value) => async dispatch => {
		let store = { type: type };
		store[name] = value;
		dispatch(store);
	};
}
